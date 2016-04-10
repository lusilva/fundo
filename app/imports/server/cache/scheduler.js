const Jobs = JobCollection('fundoQueue');

// Refresh when the server first starts up.
Meteor.startup(function() {
  Jobs.startJobServer();
  JobScheduler.runRefresh();

  Jobs.allow({
    admin: function(userId, method, params) {
      return userId;
    }
  });

  Meteor.publish('allJobs', function() {
    return Jobs.find({});
  });
});

class JobScheduler {

  static runRefresh() {
    // Create a job:
    var job = new Job(Jobs, 'refresh', {});

    // Set some properties of the job and then submit it
    job.priority('normal')
      .retry({
        retries: 5,
        wait: 15 * 60 * 1000
      })  // 15 minutes between attempts
      .save();               // Commit it to the server

    return job;
  }

  static getCity(city) {
    var job = new Job(Jobs, 'fetchCity', {
      page: 0,
      city: city
    });

    // Set some properties of the job and then submit it
    job.priority('critical')
      .retry({
        retries: 5,
        wait: 1000
      })
      .save();

    return job;
  }
}

export default JobScheduler;
