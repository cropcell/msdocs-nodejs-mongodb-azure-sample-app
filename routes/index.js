var express = require('express');
var Task = require('../models/task');
var NameVote = require('../models/namevote');
const requestIP = require('request-ip');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  const userAgent = req.get('User-Agent');
  const userId = userAgent.replace(/\D+/g, '') + "@" + requestIP.getClientIp(req);

  NameVote.find()
  .then((nameVotes) => {      
    
    //const currentVotes = nameVotes.filter(n => n.userId == userId);    
    const currentVotes = nameVotes
    const allNames = AllNames;
    //console.log(currentVotes);
    var votesToRender = [];
    for(var nameText in allNames){
      var matchedName = currentVotes.filter(n => n.name == allNames[nameText] && n.userId == userId);
      if(matchedName.length > 0){
        //console.log("match!");
        //console.log(matchedName);
        votesToRender.push({
            name: allNames[nameText],
            vote: matchedName[0].vote,
            _id: matchedName[0]._id
          });
      }
      else{
        votesToRender.push({
            name: allNames[nameText],
            vote: 0,
            _id: 0
          });
      }      
    }
    //console.log(votesToRender);
    res.render('index', { votesToRender: votesToRender });
  })
  .catch((err) => {
    console.log(err);
    res.send('Sorry! Something went wrong.');
  });
});

router.post('/updateVotes', async function(req, res, next) {
  const voteId = req.body._id;
  const userAgent = req.get('User-Agent');
  const userId = userAgent.replace(/\D+/g, '') + "@" + requestIP.getClientIp(req);

console.log(req.body);

var bulkWriteJson = '[';

for(var i in req.body._id){
  var nameVoteId = req.body._id[i];
  var nameVoteName = req.body.name[i];
  var newVote = req.body.vote[i];
  if(newVote != 0){
    if(nameVoteId == '0'){
      bulkWriteJson += '{"insertOne":{"document":{"name": "' + nameVoteName + '", "userId": "' + userId + '", "vote": ' + newVote + ' } } },'
    }
    else{
      bulkWriteJson += '{"updateOne": {"filter": { "name": "' + nameVoteName + '", "userId": "' + userId + '" }, "update": { "$set": { "vote": ' + newVote + ' } } } },'
    }
  }
}
console.log(bulkWriteJson);

var pos = bulkWriteJson.lastIndexOf(',');
bulkWriteJson = bulkWriteJson.substring(0,pos) + bulkWriteJson.substring(pos+1)
bulkWriteJson += ']';

console.log(JSON.parse(bulkWriteJson));

const bulkOperation = await NameVote.bulkWrite(JSON.parse(bulkWriteJson));
res.redirect('/');
});

router.post('/upvote', function(req, res, next) {
  const voteId = req.body._id;
  const userAgent = req.get('User-Agent');
  const userId = userAgent.replace(/\D+/g, '') + "@" + requestIP.getClientIp(req);
  const newVote = 1;

  //user hasnt voted yet
  if(voteId == 0){
    const name = req.body.name;
    console.log(name);
    var namevote = new NameVote({
      name: name,
      userId: userId,
      vote: newVote
    });
    console.log(`Adding a new nameVote ${name} - userId ${userId}`)
  
    namevote.save()
        .then(() => { 
          console.log(`Added new nameVote ${name} - userId ${userId}`)        
          res.redirect('/'); })
        .catch((err) => {
            console.log(err);
            res.send('Sorry! Something went wrong.');
        });
  }
  //updating users previous vote
  else{
    NameVote.findByIdAndUpdate(voteId, { vote: newVote})
    .then(() => { 
      console.log(`Completed vote ${voteId}`)
      res.redirect('/'); 
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
  }
});

router.post('/upvoteOld', function(req, res, next) {
  const name = req.body._id;
  const userId = req.body.uid;
  
  var namevote = new NameVote({
    name: name,
    userId: userId,
    vote: 3
  });
  console.log(`Adding a new nameVote ${name} - userId ${userId}`)

  namevote.save()
      .then(() => { 
        console.log(`Added new nameVote ${name} - userId ${userId}`)        
        res.redirect('/'); })
      .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
      });
});

///////////////////////////////////////////////////////////////////////////

router.post('/addTask', function(req, res, next) {
  const taskName = req.body.taskName;
  const createDate = Date.now();
  
  var task = new Task({
    taskName: taskName,
    createDate: createDate
  });
  console.log(`Adding a new task ${taskName} - createDate ${createDate}`)

  task.save()
      .then(() => { 
        console.log(`Added new task ${taskName} - createDate ${createDate}`)        
        res.redirect('/'); })
      .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
      });
});

router.post('/completeTask', function(req, res, next) {
  console.log("I am in the PUT method")
  const taskId = req.body._id;
  const completedDate = Date.now();

  Task.findByIdAndUpdate(taskId, { completed: true, completedDate: Date.now()})
    .then(() => { 
      console.log(`Completed task ${taskId}`)
      res.redirect('/'); }  )
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});


router.post('/deleteTask', function(req, res, next) {
  const taskId = req.body._id;
  const completedDate = Date.now();
  Task.findByIdAndDelete(taskId)
    .then(() => { 
      console.log(`Deleted task $(taskId)`)      
      res.redirect('/'); }  )
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});

const AllNames = ['apple','banana','coconut','durian','nametesT', 'longlonglongl', 'poop', 'lol'];


module.exports = router;
