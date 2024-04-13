var express = require('express');
var Task = require('../models/task');
var NameVote = require('../models/namevote');
const requestIP = require('request-ip');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  const userAgent = req.get('User-Agent');
  const userId = userAgent.replace(/\D+/g, '') + "@" + requestIP.getClientIp(req);

  let showVoted = req.query.showVoted;
  let hideVoted = req.query.hideVoted;
  let sortAbc = req.query.sortAbc;
  let sortRandom = req.query.sortRandom;

  NameVote.find()
  .then((nameVotes) => {      
    
    const currentVotes = nameVotes.filter(n => n.userId == userId);    
    //const currentVotes = nameVotes

    const allNames = AllNames;
    //console.log(currentVotes);
    var votesToRender = [];
    for(var nameText in allNames){
      var matchedName = currentVotes.filter(n => n.name == allNames[nameText]);
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

    var filteredVotes = [];
    console.log(req.query);

    if(showVoted=="1"){
      //do nothing, already shown
    }
    else if(hideVoted=="1"){
      console.log("ASDF");
      votesToRender = votesToRender.filter(n => n.vote == 0);
    }
    if(sortAbc=="1"){
      votesToRender = votesToRender.sort(function(a, b) {
        var textA = a.name;
        var textB = b.name;
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
    }
    else if(sortRandom=="1"){
      filteredVotes = votesToRender;
      let currentIndex = filteredVotes.length;

      // While there remain elements to shuffle...
      while (currentIndex != 0) {
    
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        // And swap it with the current element.
        [filteredVotes[currentIndex], filteredVotes[randomIndex]] = [
          filteredVotes[randomIndex], filteredVotes[currentIndex]];
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

  console.log(req.body.vote)

var bulkWriteJson = '[';

for(var i in req.body._id){
  var nameVoteId = req.body._id[i];
  var nameVoteName = req.body.name[i];
  var newVote = req.body.vote[i];
    if(nameVoteId == '0'){
      bulkWriteJson += '{"insertOne":{"document":{"name": "' + nameVoteName + '", "userId": "' + userId + '", "vote": ' + newVote + ' } } },'
    }
    else{
      bulkWriteJson += '{"updateOne": {"filter": { "name": "' + nameVoteName + '", "userId": "' + userId + '" }, "update": { "$set": { "vote": ' + newVote + ' } } } },'
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

const AllNames = ['apple','banana','coconut','durian','nametesT', 'longlonglongl', 'poop', 'lol'];

module.exports = router;
