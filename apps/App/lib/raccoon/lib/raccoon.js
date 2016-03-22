// This is a custom made port of recommendationRaccoon npm package by Guy Morita.
import async from 'async';
import Logger from 'App/logger';
import redis from 'redis';

class Raccoon {
    constructor(port, url, auth) {
        port = port || 6379;
        url = url || '127.0.0.1';
        auth = auth || '';

        this._client = redis.createClient(port, url);
        if (auth) {
            this._client.auth(auth, function (err) {
                if (err) {
                    throw err;
                }
            });
        }

        this._config = {
            nearestNeighbors: 5,
            className: 'event',
            numOfRecsStore: 30,
            factorLeastSimilarLeastLiked: false
        }
    };

    get client() {
        return this._client;
    };

    get config() {
        return this._config;
    };

    flush() {
        this.client.flushdb();
    };

    liked(userId, itemId, callback) {
        let that = this;

        that.client.sismember(
            [that.config.className, itemId, 'liked'].join(":"),
            userId,
            function (err, results) {
                if (err) {
                    Logger.error(err);
                    return;
                }
                if (results === 0) {
                    that.client.zincrby(
                        [that.config.className, 'mostLiked'].join(":"),
                        1,
                        itemId
                    );
                }
                that.client.sadd(
                    [that.config.className, userId, 'liked'].join(':'),
                    itemId,
                    function (err) {
                        that.client.sadd(
                            [that.config.className, itemId, 'liked'].join(':'),
                            userId,
                            function (err) {
                                that._updateSequence(userId, itemId, callback);
                            });
                    });
            });
    };

    disliked(userId, itemId, callback) {
        let that = this;
        that.client.sismember(
            [that.config.className, itemId, 'disliked'].join(":"),
            userId,
            function (err, results) {
                if (results === 0) {
                    that.client.zincrby([that.config.className, 'mostDisliked'].join(":"), 1, itemId);
                }
                that.client.sadd(
                    [that.config.className, userId, 'disliked'].join(':'),
                    itemId,
                    function (err) {
                        that.client.sadd(
                            [that.config.className, itemId, 'disliked'].join(':'),
                            userId,
                            function (err) {
                                that._updateSequence(userId, itemId, callback);
                            });
                    });
            });
    };

    unliked(userId, itemId, callback) {
        let that = this;
        that.client.sismember([that.config.className, itemId, 'liked'].join(":"), userId, function (err, results) {
            if (results > 0) {
                that.client.zincrby([that.config.className, 'mostLiked'].join(":"), -1, itemId);
            }
            that.client.srem([that.config.className, userId, 'liked'].join(':'), itemId, function (err) {
                that.client.srem([that.config.className, itemId, 'liked'].join(':'), userId, function (err) {
                    that._updateSequence(userId, itemId, callback);
                });
            });
        });
    };

    undisliked(userId, itemId, callback) {
        let that = this;
        that.client.sismember([that.config.className, itemId, 'disliked'].join(":"), userId, function (err, results) {
            if (results > 0) {
                that.client.zincrby([that.config.className, 'mostDisliked'].join(":"), -1, itemId);
            }
            that.client.srem([that.config.className, userId, 'disliked'].join(':'), itemId, function (err) {
                that.client.srem([that.config.className, itemId, 'disliked'].join(':'), userId, function (err) {
                    that._updateSequence(userId, itemId, callback);
                });
            });
        });
    };

    _updateSequence(userId, itemId, callback) {
        let that = this;
        this._updateSimilarityFor(userId, function () {
            async.parallel([
                    function (cb) {
                        that._updateWilsonScore(itemId, function () {
                            cb(null);
                        });
                    },
                    function (cb) {
                        that._updateRecommendationsFor(userId, function () {
                            cb(null);
                        });
                    }
                ],
                function (err) {
                    if (err) {
                        console.log('error', err);
                    }
                    if (callback)
                        callback();
                });
        });
    };

    // the jaccard coefficient outputs an objective measurement of the similarity between two objects. in this case, two users. the coefficient
    // is the result of summing the two users likes/dislikes incommon then summing they're likes/dislikes that they disagree on. this sum is
    // then divided by the number of items they both reviewed.
    _jaccardCoefficient(userId1, userId2, callback) {
        let that = this;
        // setting all variables to zero
        var similarity = 0,
            finalJaccard = 0,
            ratedInCommon = 0;
        // retrieving a set of all the users likes incommon
        that.client.sinter([that.config.className, userId1, 'liked'].join(":"), [that.config.className, userId2, 'liked'].join(":"), function (err, results1) {
            // retrieving a set of the users dislike incommon
            that.client.sinter([that.config.className, userId1, 'disliked'].join(":"), [that.config.className, userId2, 'disliked'].join(":"), function (err, results2) {
                // retrieving a set of the users like and dislikes that they disagree on
                that.client.sinter([that.config.className, userId1, 'liked'].join(":"), [that.config.className, userId2, 'disliked'].join(":"), function (err, results3) {
                    // retrieving a set of the users like and dislikes that they disagree on
                    that.client.sinter([that.config.className, userId1, 'disliked'].join(":"), [that.config.className, userId2, 'liked'].join(":"), function (err, results4) {
                        // calculating the sum of the similarities minus the sum of the disagreements
                        similarity = (results1.length + results2.length - results3.length - results4.length);
                        // calculating the number of movies rated incommon
                        ratedInCommon = (results1.length + results2.length + results3.length + results4.length);
                        // calculating the the modified jaccard score. similarity / num of comparisons made incommon
                        let finalJaccardScore = similarity / ratedInCommon;
                        // calling the callback function passed to jaccard with the new score
                        callback(finalJaccardScore);
                    });
                });
            });
        });
    };

    // this function updates the similarity for one user versus all others. at scale this probably needs to be refactored to compare a user
    // against clusters of users instead of against all. every comparison will be a value between -1 and 1 representing simliarity.
    // -1 is exact opposite, 1 is exactly the same.
    _updateSimilarityFor(userId, cb) {
        let that = this;
        // turning the userId into a string. depending on the db they might send an object, in which it won't compare properly when comparing
        // to other users
        userId = String(userId);
        // initializing variables
        var similaritySet, userRatedItemIds, itemLiked, itemDisliked, itemLikeDislikeKeys;
        // setting the redis key for the user's similarity set
        similaritySet = [that.config.className, userId, 'similaritySet'].join(":");
        // creating a combined set with the all of a users likes and dislikes
        that.client.sunion([that.config.className, userId, 'liked'].join(":"), [that.config.className, userId, 'disliked'].join(":"), function (err, userRatedItemIds) {
            // if they have rated anything
            if (userRatedItemIds.length > 0) {
                // creating a list of redis keys to look up all of the likes and dislikes for a given set of items
                itemLikeDislikeKeys = _.map(userRatedItemIds, function (itemId, key) {
                    // key for that item being liked
                    itemLiked = [that.config.className, itemId, 'liked'].join(":");
                    // key for the item being disliked
                    itemDisliked = [that.config.className, itemId, 'disliked'].join(":");
                    // returning an array of those keys
                    return [itemLiked, itemDisliked];
                });
            }
            // flattening the array of all the likes/dislikes for the items a user rated
            itemLikeDislikeKeys = _.flatten(itemLikeDislikeKeys);
            // builds one set of all the users who liked and disliked the same items
            that.client.sunion(itemLikeDislikeKeys, function (err, otherUserIdsWhoRated) {
                // it can be undefined with "unlike" and "undislike"
                if (otherUserIdsWhoRated === undefined) otherUserIdsWhoRated = [];
                // running in async parallel, going through the array of user ids who also rated the same things
                async.each(otherUserIdsWhoRated,
                    // running a function on each item in the list
                    function (otherUserId, callback) {
                        // if there is only one other user or the other user is the same user
                        if (otherUserIdsWhoRated.length === 1 || userId === otherUserId) {
                            // then call the callback and exciting the similarity check
                            callback();
                        }
                        // if the userid is not the same as the user
                        if (userId !== otherUserId) {
                            // calculate the jaccard coefficient for similarity. it will return a value between -1 and 1 showing the two users
                            // similarity
                            that._jaccardCoefficient(userId, otherUserId, function (result) {
                                // with the returned similarity score, add it to a sorted set named above
                                that.client.zadd(similaritySet, result, otherUserId, function (err) {
                                    // call the async callback function once finished to indicate that the process is finished
                                    callback();
                                });
                            });
                        }
                    },
                    // once all the async comparisons have been made, call the final callback based to the original function
                    function (err) {
                        cb();
                    }
                );
            });
        });
    };

    _predictFor(userId, itemId, callback) {
        let that = this;
        userId = String(userId);
        itemId = String(itemId);
        var finalSimilaritySum = 0.0;
        var prediction = 0.0;
        var similaritySet = [that.config.className, userId, 'similaritySet'].join(':');
        var likedBySet = [that.config.className, itemId, 'liked'].join(':');
        var dislikedBySet = [that.config.className, itemId, 'disliked'].join(':');
        that._similaritySum(similaritySet, likedBySet, function (result1) {
            that._similaritySum(similaritySet, dislikedBySet, function (result2) {
                finalSimilaritySum = result1 - result2;
                that.client.scard(likedBySet, function (err, likedByCount) {
                    that.client.scard(dislikedBySet, function (err, dislikedByCount) {
                        prediction = finalSimilaritySum / parseFloat(likedByCount + dislikedByCount);
                        if (isFinite(prediction)) {
                            callback(prediction);
                        } else {
                            callback(0.0);
                        }
                    });
                });
            });
        });
    };

    _similaritySum(simSet, compSet, cb) {
        var similarSum = 0.0;
        let that = this;
        that.client.smembers(compSet, function (err, userIds) {
            async.each(userIds,
                function (userId, callback) {
                    that.client.zscore(simSet, userId, function (err, zScore) {
                        similarSum += parseFloat(zScore);
                        callback();
                    });
                },
                function (err) {
                    cb(similarSum);
                }
            );
        });
    };

    // after the similarity is updated for the user, the users recommendations are updated
    // recommendations consist of a sorted set in Redis. the values of this set are
    // names of the items and the score is what raccoon estimates that user would rate it
    // the values are generally not going to be -1 or 1 exactly because there isn't 100%
    // certainty.
    _updateRecommendationsFor(userId, cb) {
        let that = this;
        // turning the user input into a string so it can be compared properly
        userId = String(userId);
        // creating two blank arrays
        var setsToUnion = [];
        var scoreMap = [];
        // initializing the redis keys for temp sets, the similarity set and the recommended set
        var tempSet = [that.config.className, userId, 'tempSet'].join(":");
        var tempDiffSet = [that.config.className, userId, 'tempDiffSet'].join(":");
        var similaritySet = [that.config.className, userId, 'similaritySet'].join(":");
        var recommendedSet = [that.config.className, userId, 'recommendedSet'].join(":");
        // returns an array of the users that are most similar within k nearest neighbors
        that.client.zrevrange(similaritySet, 0, that.config.nearestNeighbors - 1, function (err, mostSimilarUserIds) {
            // returns an array of the users that are least simimilar within k nearest neighbors
            that.client.zrange(similaritySet, 0, that.config.nearestNeighbors - 1, function (err, leastSimilarUserIds) {
                // iterate through the user ids to create the redis keys for all those users likes
                _.each(mostSimilarUserIds, function (id, key) {
                    setsToUnion.push([that.config.className, id, 'liked'].join(":"));
                });
                // if you want to factor in the least similar least likes, you change this in config
                // left it off because it was recommending items that every disliked universally
                if (that.config.factorLeastSimilarLeastLiked) {
                    _.each(leastSimilarUserIds, function (id, key) {
                        setsToUnion.push([that.config.className, id, 'disliked'].join(":"));
                    });
                }
                // if there is at least one set in the array, continue
                if (setsToUnion.length > 0) {
                    // iterate through the sets asyncronously. i chose async because they can be run in parallel
                    // and because without promises, this was the fastest and easiest implementation to handle all
                    // the callbacks. this will likely get refactored to use promises.
                    async.each(setsToUnion,
                        function (set, callback) {
                            that.client.sunionstore(tempSet, set, function (err) {
                                callback();
                            });
                        },
                        function (err) {
                            // using the new array of all the items that were liked by people similar and disliked by people opposite, create a new set with all the
                            // items that the current user hasn't already rated
                            that.client.sdiff(tempSet, [that.config.className, userId, 'liked'].join(":"), [that.config.className, userId, 'disliked'].join(":"), function (err, notYetRatedItems) {
                                // with the array of items that user has not yet rated, iterate through all of them and predict what the current user would rate it
                                async.each(notYetRatedItems,
                                    function (itemId, callback) {
                                        that._predictFor(userId, itemId, function (score) {
                                            // push the score and item to the score map array.
                                            scoreMap.push([score, itemId]);
                                            callback();
                                        });
                                    },
                                    // using score map which is an array of what the current user would rate all the unrated items,
                                    // add them to that users sorted recommended set
                                    function (err) {
                                        that.client.del(recommendedSet, function (err) {
                                            async.each(scoreMap,
                                                function (scorePair, callback) {
                                                    that.client.zadd(recommendedSet, scorePair[0], scorePair[1], function (err) {
                                                        callback();
                                                    });
                                                },
                                                // after all the additions have been made to the recommended set,
                                                function (err) {
                                                    that.client.del(tempSet, function (err) {
                                                        that.client.zcard(recommendedSet, function (err, length) {
                                                            that.client.zremrangebyrank(recommendedSet, 0, length - that.config.numOfRecsStore - 1, function (err) {
                                                                cb();
                                                            });
                                                        });
                                                    });
                                                }
                                            );
                                        });
                                    }
                                );
                            });
                        }
                    );
                } else {
                    cb();
                }
            });
        });
    };


    // the wilson score is a proxy for 'best rated'. it represents the best finding the best ratio of likes and also eliminating
    // outliers. the wilson score is a value between 0 and 1.
    _updateWilsonScore(itemId, callback) {
        let that = this;
        // creating the redis keys for scoreboard and to get the items liked and disliked sets
        var scoreBoard = [that.config.className, 'scoreBoard'].join(":");
        var likedBySet = [that.config.className, itemId, 'liked'].join(':');
        var dislikedBySet = [that.config.className, itemId, 'disliked'].join(':');
        // used for a confidence interval of 95%
        var z = 1.96;
        // initializing variables to calculate wilson score
        var n, pOS, score;
        // getting the liked count for the item
        that.client.scard(likedBySet, function (err, likedResults) {
            // getting the disliked count for the item
            that.client.scard(dislikedBySet, function (err, dislikedResults) {
                // if the total count is greater than zero
                if ((likedResults + dislikedResults) > 0) {
                    // set n to the sum of the total ratings for the item
                    n = likedResults + dislikedResults;
                    // set pOS to the num of liked results divided by the number rated
                    // pOS represents the proportion of successes or likes in this case
                    pOS = likedResults / parseFloat(n);
                    // try the following equation
                    try {
                        // calculating the wilson score
                        // http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
                        score = (pOS + z * z / (2 * n) - z * Math.sqrt((pOS * (1 - pOS) + z * z / (4 * n)) / n)) / (1 + z * z / n);
                    } catch (e) {
                        // if an error occurs, set the score to 0.0 and console log the error message.
                        console.log(e.name + ": " + e.message);
                        score = 0.0;
                    }
                    // add that score to the overall scoreboard. if that item already exists, the score will be updated.
                    that.client.zadd(scoreBoard, score, itemId, function (err) {
                        // call the final callback sent to the initial function.
                        callback();
                    });
                } else {
                    callback();
                }
            });
        });
    };

    recommendFor(userId, numberOfRecs, callback) {
        this.client.zrevrange(
            [
                this.config.className,
                userId,
                'recommendedSet'
            ].join(":"),
            0,
            numberOfRecs,
            function (err, results) {
                callback(err, results);
            }
        );
    };

    bestRated(callback) {
        this.client.zrevrange([this.config.className, 'scoreBoard'].join(":"), 0, -1, function (err, results) {
            callback(results);
        });
    };

    worstRated(callback) {
        this.client.zrange([this.config.className, 'scoreBoard'].join(":"), 0, -1, function (err, results) {
            callback(results);
        });
    };

    bestRatedWithScores(numOfRatings, callback) {
        this.client.zrevrange([this.config.className, 'scoreBoard'].join(":"), 0, numOfRatings, 'withscores', function (err, results) {
            callback(results);
        });
    };

    mostLiked(callback) {
        this.client.zrevrange([this.config.className, 'mostLiked'].join(":"), 0, -1, function (err, results) {
            callback(results);
        });
    };

    mostDisliked(callback) {
        this.client.zrevrange([this.config.className, 'mostDisliked'].join(":"), 0, -1, function (err, results) {
            callback(results);
        });
    };

    mostSimilarUsers(userId, callback) {
        this.client.zrevrange([this.config.className, userId, 'similaritySet'].join(":"), 0, -1, function (err, results) {
            callback(results);
        });
    };

    leastSimilarUsers(userId, callback) {
        this.client.zrange([this.config.className, userId, 'similaritySet'].join(":"), 0, -1, function (err, results) {
            callback(results);
        });
    };

    likedBy(itemId, callback) {
        this.client.smembers([this.config.className, itemId, 'liked'].join(':'), function (err, results) {
            callback(results);
        });
    };

    likedCount(itemId, callback) {
        this.client.scard([this.config.className, itemId, 'liked'].join(':'), function (err, results) {
            callback(results);
        });
    };

    dislikedBy(itemId, callback) {
        this.client.smembers([this.config.className, itemId, 'disliked'].join(':'), function (err, results) {
            callback(results);
        });
    };

    dislikedCount(itemId, callback) {
        this.client.scard([this.config.className, itemId, 'disliked'].join(':'), function (err, results) {
            callback(results);
        });
    };

    allLikedFor(userId, callback) {
        this.client.smembers([this.config.className, userId, 'liked'].join(":"), function (err, results) {
            callback(results);
        });
    };

    allDislikedFor(userId, callback) {
        this.client.smembers([this.config.className, userId, 'disliked'].join(":"), function (err, results) {
            callback(results);
        });
    };

    allWatchedFor(userId, callback) {
        this.client.sunion([this.config.className, userId, 'liked'].join(":"), [this.config.className, userId, 'disliked'].join(":"), function (err, results) {
            callback(results);
        });
    }
}

const raccoon = Meteor.settings.enableRedisRecommendations ?
    new Raccoon(
        Meteor.settings.redis.port,
        Meteor.settings.redis.url,
        Meteor.settings.redis.password
    ) : null;
export default raccoon;

