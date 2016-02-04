/* global React */

const { Mixins, Styles } = MaterialUI;
const { StylePropable, StyleResizable } = Mixins;
const { Colors, Spacing, Typography, lightBaseTheme } = Styles;

Home = React.createClass({

    mixins: [
        StylePropable,
        StyleResizable
    ],

    animationDelay: 2500,
    lettersDelay: 50,

    componentDidMount() {
        this.initHeadline();
    },

    initHeadline() {
        //insert <i> element for each letter of a changing word
        this.singleLetters($('.cd-headline.letters').find('.animated-word'));
        //initialise headline animation
        this.animateHeadline($('.cd-headline'));
    },

    singleLetters($words) {
        $words.each(function () {
            var word = $(this),
                letters = word.text().split(''),
                selected = word.hasClass('is-visible');
            for (i in letters) {
                if (word.parents('.rotate-2').length > 0) letters[i] = '<em>' + letters[i] + '</em>';
                letters[i] = (selected) ? '<i class="in">' + letters[i] + '</i>' : '<i>' + letters[i] + '</i>';
            }
            var newLetters = letters.join('');
            word.html(newLetters).css('opacity', 1);
        });
    },

    animateHeadline($headlines) {
        var that = this;
        var duration = this.animationDelay;
        $headlines.each(function () {
            var headline = $(this);

            //trigger animation
            setTimeout(function () {
                that.hideWord(headline.find('.is-visible').eq(0))
            }, duration);
        });
    },

    hideWord($word) {
        var that = this;
        var nextWord = this.takeNext($word);

        if ($word.parents('.cd-headline').hasClass('letters')) {
            var bool = ($word.children('i').length >= nextWord.children('i').length) ? true : false;
            this.hideLetter($word.find('i').eq(0), $word, bool, this.lettersDelay);
            this.showLetter(nextWord.find('i').eq(0), nextWord, bool, this.lettersDelay);
        } else {
            this.switchWord($word, nextWord);
            setTimeout(function () {
                that.hideWord(nextWord)
            }, this.animationDelay);
        }
    },

    hideLetter($letter, $word, $bool, $duration) {
        $letter.removeClass('in').addClass('out');

        var that = this;

        if (!$letter.is(':last-child')) {
            setTimeout(function () {
                that.hideLetter($letter.next(), $word, $bool, $duration);
            }, $duration);
        } else if ($bool) {
            setTimeout(function () {
                that.hideWord(that.takeNext($word))
            }, this.animationDelay);
        }

        if ($letter.is(':last-child') && $('html').hasClass('no-csstransitions')) {
            var nextWord = this.takeNext($word);
            this.switchWord($word, nextWord);
        }
    },

    showLetter($letter, $word, $bool, $duration) {
        $letter.addClass('in').removeClass('out');
        var that = this;

        if (!$letter.is(':last-child')) {
            setTimeout(function () {
                that.showLetter($letter.next(), $word, $bool, $duration);
            }, $duration);
        } else {
            if ($word.parents('.cd-headline').hasClass('type')) {
                setTimeout(function () {
                    $word.parents('.cd-words-wrapper').addClass('waiting');
                }, 200);
            }
            if (!$bool) {
                setTimeout(function () {
                    that.hideWord($word)
                }, this.animationDelay)
            }
        }
    },

    takeNext($word) {
        return (!$word.is(':last-child')) ? $word.next() : $word.parent().children().eq(0);
    },

    switchWord($oldWord, $newWord) {
        $oldWord.removeClass('is-visible').addClass('is-hidden');
        $newWord.removeClass('is-hidden').addClass('is-visible');
    },

    _getHomePageHero() {
        let styles = {
            root: {
                backgroundColor: Colors.lightBlue500,
                overflow: 'hidden'
            },
            svgLogo: {
                margin: '0 auto',
                display: 'block'
            },
            tagline: {
                margin: '16px auto 0 auto',
                textAlign: 'center',
                maxWidth: 575
            },
            label: {
                color: lightBaseTheme.palette.primary1Color
            },
            githubStyle: {
                margin: '16px 32px 0px 8px'
            },
            demoStyle: {
                margin: '16px 32px 0px 32px'
            },
            h1: {
                color: Colors.darkWhite,
                fontWeight: Typography.fontWeightLight,
                fontSize: 30
            },
            nowrap: {
                whiteSpace: 'nowrap'
            },
            taglineWhenLarge: {
                marginTop: 32
            },
            h1WhenLarge: {
                fontSize: 56
            }
        };

        styles.h2 = this.mergeStyles(styles.h1, styles.h2);

        if (this.isDeviceSize(StyleResizable.statics.Sizes.LARGE)) {
            styles.tagline = this.mergeStyles(styles.tagline, styles.taglineWhenLarge);
            styles.h1 = this.mergeStyles(styles.h1, styles.h1WhenLarge);
        }

        let header = Meteor.isClient ? (
            <h1 style={styles.h1} className="cd-headline letters rotate-2">
                <span style={styles.nowrap}>
                    <span> Find nearby </span>
                    <span style={{color: '#ff0000' }} className="cd-words-wrapper">
                        <span className="is-visible animated-word">festivals</span>
                        <span className="animated-word">comedy</span>
                        <span className="animated-word">concerts</span>
                        <span className="animated-word">museums</span>
                        <span className="animated-word">conferences</span>
                        <span className="animated-word">fundraisers</span>
                        <span className="animated-word">hiking</span>
                        <span className="animated-word">organizations</span>
                    </span>
                </span>
            </h1> ) : (
            <h1 style={styles.h1}>fundo is music <br /> made easy </h1>

        );

        return (
            <FullWidthSection style={styles.root}>
                <img style={styles.svgLogo} src="images/fundo.png" />
                <div style={styles.tagline}>
                    { header }
                </div>
            </FullWidthSection>
        );
    },

    render() {
        const style = {
            paddingTop: Spacing.desktopKeylineIncrement
        };

        return (
            <div style={style}>
                {this._getHomePageHero()}
            </div>
        );
    }
});
