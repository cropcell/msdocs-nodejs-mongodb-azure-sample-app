var express = require('express');
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


  //THE OFFICIAL WAY TO VIEW RESULTS
  //UCOMMENT OUT THE BELOW AGGREGATE FUNCTION
  //VIEW RESULTS IN VSCODE TERMINAL WINDOW
  // NameVote.aggregate([
  //   { $group: { _id: '$name', totalVotes: { $sum: "$vote" } } }
  // ]).sort("-totalVotes").then((resultss) => {
  //   console.log(resultss);
  // });

  

  NameVote.find()
  .then((nameVotes) => {      
    
    const currentVotes = nameVotes.filter(n => n.userId == userId);    

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
    //console.log(req.query);

    if(showVoted=="1"){
      //do nothing, already shown
    }
    else if(hideVoted=="1"){
      votesToRender = votesToRender.filter(n => n.vote == 0);
      //use if a neutral vote can be counted (performed with a vote, then undoing the vote)
      //votesToRender = votesToRender.filter(n => n._id == 0);
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

  //console.log(req.body.vote)

var bulkWriteJson = '[';

for(var i in req.body._id){
  var nameVoteName = req.body.name[i];
  var newVote = req.body.vote[i];
  var isDirty = req.body._isDirty[i];

  if(isDirty == "1"){
      bulkWriteJson += '{"updateOne": {"filter": { "name": "' + nameVoteName + '", "userId": "' + userId + '" }, "update": { "$set": { "vote": ' + newVote + ' } }, "upsert": true } },'
  }
}


var pos = bulkWriteJson.lastIndexOf(',');
bulkWriteJson = bulkWriteJson.substring(0,pos) + bulkWriteJson.substring(pos+1)
bulkWriteJson += ']';

//console.log(bulkWriteJson);

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

const AllNamesTest = ['apple','banana','coconut','durian','nametesT', 'longlonglongl', 'poop', 'lol'];

const AllNames = [
  "Aladal",
  "Aladar",
  "Alados",
  "Aladoth",
  "Alagol",
  "Alagos",
  "Alanda",
  "Alaya",
  "Alayal",
  "Alayar",
  "Alazar",
  "Alazir",
  "Alazol",
  "Alazon",
  "Alazos",
  "Alazoth",
  "Alazus",
  "Algabon",
  "Algadal",
  "Algadal",
  "Algadar",
  "Algadara",
  "Algadon",
  "Algados",
  "Algaloa",
  "Algaloar",
  "Algaloas",
  "Algalock",
  "Algalon",
  "Algalora",
  "Algalore",
  "Algalos",
  "Algalus",
  "Algama",
  "Algamal",
  "Algamance",
  "Algamand",
  "Algamar",
  "Algamus",
  "Algan",
  "Algana",
  "Alganda",
  "Algandos",
  "Alganos",
  "Alganoth",
  "Algara",
  "Algaros",
  "Algas",
  "Algazar",
  "Algazoa",
  "Algazol",
  "Algazon",
  "Algazora",
  "Algazos",
  "Algeroth",
  "Algodar",
  "Algodara",
  "Algola",
  "Algona",
  "Algonda",
  "Algondal",
  "Algorock",
  "Algos",
  "Algozar",
  "Alguaya",
  "Alguayaca",
  "Aloar",
  "Aloquan",
  "Alora",
  "Aloron",
  "Aloros",
  "Aloroth",
  "Altaris",
  "Aluanda",
  "Aluar",
  "Aludan",
  "Ansatal",
  "Ansatar",
  "Antala",
  "Antalore",
  "Antanda",
  "Antara",
  "Antaris",
  "Antaro",
  "Antaroth",
  "Antarox",
  "Antaya",
  "Antazar",
  "Anteas",
  "Anteron",
  "Anteros",
  "Antola",
  "Antolar",
  "Antolos",
  "Antora",
  "Antores",
  "Antorza",
  "Antoza",
  "Aquala",
  "Aqualon",
  "Aqualos",
  "Aquana",
  "Aquanal",
  "Aquanda",
  "Aquandal",
  "Aquandar",
  "Aquawana",
  "Aquaya",
  "Aquazala",
  "Aquazar",
  "Aquazoa",
  "Aquilus",
  "Aragoth",
  "Arcala",
  "Arcalon",
  "Arcaya",
  "Arquan",
  "Arquanda",
  "Aruda",
  "Arudar",
  "Arudara",
  "Arugos",
  "Autala",
  "Autalon",
  "Autar",
  "Autara",
  "Azola",
  "Azolos",
  "Bazagos",
  "Bazarock",
  "Belogos",
  "Belore",
  "Belorend",
  "Beloron",
  "Beloros",
  "Beloroth",
  "Bewoanda",
  "Bewonder",
  "Beyonda",
  "Beyondal",
  "Beyondar",
  "Beyonderon",
  "Caladon",
  "Calados",
  "Calagos",
  "Calante",
  "Calantos",
  "Calaton",
  "Calaya",
  "Calazar",
  "Calazoa",
  "Calazos",
  "Calazoth",
  "Calcagos",
  "Calcana",
  "Calcanand",
  "Calcanos",
  "Calcante",
  "Calcaya",
  "Calcoa",
  "Caldwana",
  "Caloa",
  "Calodar",
  "Calogos",
  "Caloza",
  "Caltara",
  "Caltaros",
  "Caltaroth",
  "Calteron",
  "Calteros",
  "Calwana",
  "Cazagal",
  "Cazagos",
  "Cazala",
  "Cazara",
  "Celadar",
  "Celagon",
  "Celagos",
  "Celamance",
  "Celanda",
  "Celatar",
  "Celatos",
  "Celemance",
  "Celescape",
  "Celescar",
  "Celescon",
  "Celescos",
  "Celetal",
  "Celezar",
  "Celiscape",
  "Celiscar",
  "Cellados",
  "Cellock",
  "Celscapa",
  "Celtara",
  "Celtaros",
  "Chelladon",
  "Colderoth",
  "Cooldara",
  "Copagol",
  "Copagos",
  "Coqualon",
  "Coquante",
  "Coragal",
  "Coragos",
  "Coremance",
  "Corock",
  "Corockos",
  "Corocon",
  "Cosagal",
  "Cosagos",
  "Cosala",
  "Cosalon",
  "Cosalos",
  "Cosara",
  "Cosaros",
  "Cosaroth",
  "Coshala",
  "Cosmara",
  "Cosmaros",
  "Cosmaroth",
  "Cosmica",
  "Cosmicanda",
  "Cosmicon",
  "Cosmicos",
  "Cosmigos",
  "Cosmiros",
  "Cosmoar",
  "Cosmoca",
  "Cosmocal",
  "Cosmocos",
  "Cosmodal",
  "Cosmodan",
  "Cosmodar",
  "Cosmodas",
  "Cosmogos",
  "Cosmolon",
  "Cosmolos",
  "Cosmonda",
  "Cosmondos",
  "Cosmoscape",
  "Cosmozal",
  "Cosmozar",
  "Cosmozon",
  "Cosmozos",
  "Cozaela",
  "Cozagal",
  "Cozagos",
  "Cozala",
  "Cozanda",
  "Cozaris",
  "Cozaru",
  "Cozarus",
  "Cozolar",
  "Cuthal",
  "Cuthar",
  "Cutharos",
  "Cuzoa",
  "Cuzola",
  "Cuzolos",
  "Dakron",
  "Dalamar",
  "Dalamond",
  "Dalaquan",
  "Dalazoa",
  "Dalazoth",
  "Danara",
  "Discolos",
  "Discoloth",
  "Discomance",
  "Discozoth",
  "Doqualon",
  "Doquan",
  "Dorana",
  "Doranos",
  "Dozala",
  "Dozalos",
  "Dozar",
  "Dozara",
  "Dozaros",
  "Dozolar",
  "Dozolon",
  "Durana",
  "Duranos",
  "Dwana",
  "Dwazala",
  "Eladon",
  "Eladore",
  "Eladoth",
  "Elagos",
  "Elaquan",
  "Elazoa",
  "Elazos",
  "Eldara",
  "Eldaros",
  "Eldaroth",
  "Eldoral",
  "Eledar",
  "Elezon",
  "Elezor",
  "Eltar",
  "Eltara",
  "Eltaron",
  "Eltaros",
  "Eltaroth",
  "Erados",
  "Eradoth",
  "Eragos",
  "Erascos",
  "Erodar",
  "Eroscape",
  "Eroscar",
  "Eroscon",
  "Escapica",
  "Escapicon",
  "Escasia",
  "Escopia",
  "Fantar",
  "Feladon",
  "Fenazar",
  "Fenous",
  "Fenoza",
  "Fenra",
  "Fenralon",
  "Fenrana",
  "Fenrazoth",
  "Fenzadar",
  "Fenzados",
  "Fenzadoth",
  "Fenzagol",
  "Fenzagos",
  "Fenzalos",
  "Fenzana",
  "Fenzani",
  "Fenzanos",
  "Fenzara",
  "Fenzaral",
  "Fenzaron",
  "Fenzaros",
  "Fenzir",
  "Fenzoa",
  "Fenzoar",
  "Fenzodar",
  "Fenzona",
  "Fenzonius",
  "Fenzonoth",
  "Fenzora",
  "Fenzoral",
  "Fenzoroth",
  "Fenzuda",
  "Fenzudan",
  "Fenzus",
  "Ferana",
  "Feranos",
  "Feranoth",
  "Gabadon",
  "Gabados",
  "Gabadoth",
  "Gabagos",
  "Gabalon",
  "Gabanda",
  "Gaboa",
  "Gabogos",
  "Gabolon",
  "Gabolos",
  "Gabon",
  "Gabora",
  "Gaboros",
  "Gaboza",
  "Gabuan",
  "Gadara",
  "Gadaral",
  "Gadaros",
  "Gadaroth",
  "Galadar",
  "Galadon",
  "Galados",
  "Galadoth",
  "Galagos",
  "Galagos",
  "Galaji",
  "Galamance",
  "Galana",
  "Galanara",
  "Galanos",
  "Galanoth",
  "Galanox",
  "Galante",
  "Galantos",
  "Galapolis",
  "Galapos",
  "Galaquan",
  "Galaro",
  "Galaron",
  "Galaros",
  "Galascape",
  "Galascon",
  "Galatar",
  "Galatos",
  "Galaya",
  "Galayond",
  "Galazar",
  "Galazoa",
  "Galazon",
  "Galdania",
  "Galdanoth",
  "Galerogos",
  "Galeros",
  "Galeus",
  "Galnara",
  "Galoa",
  "Galoar",
  "Galoas",
  "Galogoth",
  "Galolar",
  "Galonder",
  "Galopia",
  "Galoza",
  "Galtara",
  "Galtaris",
  "Galteroth",
  "Galuan",
  "Galuana",
  "Galuara",
  "Galyonda",
  "Galyonder",
  "Gantara",
  "Gantaral",
  "Garoza",
  "Garozoth",
  "Gascapos",
  "Gawanda",
  "Gazoa",
  "Gazolore",
  "Gazora",
  "Gazoros",
  "Glaucazoa",
  "Glauquan",
  "Glauzala",
  "Glazara",
  "Glazaros",
  "Goahn",
  "Goalore",
  "Gohn",
  "Goladar",
  "Golagos",
  "Golaris",
  "Golazar",
  "Golazos",
  "Gonagos",
  "Gonda",
  "Gondar",
  "Gondara",
  "Gondaros",
  "Gondrana",
  "Gondranoth",
  "Gonquan",
  "Gonquana",
  "Goracos",
  "Gorocon",
  "Graquan",
  "Guadala",
  "Guadalar",
  "Guadalos",
  "Guadaloth",
  "Guadan",
  "Guadana",
  "Guadanos",
  "Guadanya",
  "Guadar",
  "Guadara",
  "Guadaro",
  "Guadaros",
  "Guadegon",
  "Guadela",
  "Guaderos",
  "Guadica",
  "Guadol",
  "Guadola",
  "Guadon",
  "Guahala",
  "Guahalos",
  "Guakron",
  "Guakrons",
  "Gualadar",
  "Gualadon",
  "Gualadoth",
  "Gualazar",
  "Gualazos",
  "Gualia",
  "Gualore",
  "Gualos",
  "Guana",
  "Guanadon",
  "Guanalon",
  "Guandar",
  "Guandaris",
  "Guandaros",
  "Guandaroth",
  "Guandaya",
  "Guanderon",
  "Guanladar",
  "Guanlados",
  "Guanlar",
  "Guanlara",
  "Guantalos",
  "Guantara",
  "Guantaros",
  "Guatala",
  "Guatalia",
  "Guataris",
  "Guaya",
  "Guayanda",
  "Guazala",
  "Guazalos",
  "Guazar",
  "Guazoa",
  "Guazola",
  "Ilhan",
  "Ilhara",
  "Illiscape",
  "Illiscar",
  "Illiscos",
  "Illius",
  "Illizar",
  "Juala",
  "Kahamos",
  "Kahara",
  "Kaharon",
  "Kaharos",
  "Kaharoth",
  "Kahaya",
  "Kahazala",
  "Kahir",
  "Kahonium",
  "Kahonius",
  "Kahuaya",
  "Kalagos",
  "Kalatar",
  "Kalatos",
  "Karodara",
  "Karodon",
  "Karodoth",
  "Karogos",
  "Karoth",
  "Karox",
  "Karoxa",
  "Karudan",
  "Karzala",
  "Karzalon",
  "Kazagos",
  "Kazala",
  "Kazalon",
  "Kazalos",
  "Kazantos",
  "Kazar",
  "Kazara",
  "Kazaros",
  "Kazayon",
  "Kazoa",
  "Kazoar",
  "Kazodar",
  "Kazodoth",
  "Kazoloa",
  "Kazolon",
  "Kazolore",
  "Kazona",
  "Kazonda",
  "Kazondos",
  "Kazora",
  "Kazoth",
  "Kazoya",
  "Kazuan",
  "Kazugos",
  "Kodara",
  "Kodaros",
  "Koquadar",
  "Koquan",
  "Koquanil",
  "Koragos",
  "Koragoth",
  "Korocos",
  "Koroq",
  "Koroqa",
  "Kozondar",
  "Kradalos",
  "Kradara",
  "Kradaros",
  "Kradon",
  "Kradua",
  "Krahala",
  "Krahalore",
  "Krahan",
  "Kramonde",
  "Krazala",
  "Krazalagos",
  "Krazalon",
  "Krazalos",
  "Krazana",
  "Krazante",
  "Krazar",
  "Krazaya",
  "Krazir",
  "Krazoa",
  "Krazogos",
  "Krazola",
  "Krazomis",
  "Krazona",
  "Krazoya",
  "Krazuaya",
  "Krazuayar",
  "Krazuda",
  "Krazudan",
  "Krazudos",
  "Krazulus",
  "Krodagos",
  "Krodan",
  "Kroderos",
  "Kronagos",
  "Kronala",
  "Kronaloth",
  "Kroneron",
  "Kroneros",
  "Kronir",
  "Kroniros",
  "Kronquan",
  "Kronquanos",
  "Krontos",
  "Krotal",
  "Krudara",
  "Krudaros",
  "Lakrol",
  "Lakron",
  "Lazir",
  "Lazoa",
  "Lazolos",
  "Loakronar",
  "Lodara",
  "Lodaros",
  "Lodaroth",
  "Lokron",
  "Lokronal",
  "Lokronos",
  "Loradon",
  "Lorados",
  "Loradoth",
  "Loragos",
  "Lorazal",
  "Loredar",
  "Loregal",
  "Loremance",
  "Lorescape",
  "Lorescara",
  "Lorescaros",
  "Lorica",
  "Lorical",
  "Loricon",
  "Loricos",
  "Lormance",
  "Loroza",
  "Lorozath",
  "Loscara",
  "Loscaros",
  "Loscaroth",
  "Lothala",
  "Lothalon",
  "Lothalos",
  "Lothan",
  "Lothante",
  "Lothantis",
  "Lothantos",
  "Lothela",
  "Lowana",
  "Mahakron",
  "Mahakros",
  "Mahala",
  "Mahalon",
  "Makronos",
  "Malagos",
  "Maloros",
  "Mante",
  "Mantos",
  "Maphoza",
  "Maragos",
  "Marana",
  "Mastacon",
  "Mathalas",
  "Mathaloar",
  "Mathaloas",
  "Mathalore",
  "Mathalos",
  "Mathar",
  "Matharol",
  "Matharon",
  "Matharos",
  "Matheragos",
  "Matheros",
  "Mathora",
  "Mathoros",
  "Mazala",
  "Mazara",
  "Mezodar",
  "Mezoscape",
  "Mezoscos",
  "Mistereo",
  "Misteros",
  "Mokradon",
  "Mokronda",
  "Montara",
  "Montaros",
  "Montaroth",
  "Moquan",
  "Mosadar",
  "Mosados",
  "Mosalar",
  "Mosalos",
  "Mosasia",
  "Moscalos",
  "Moscapalon",
  "Moscape",
  "Mosoas",
  "Mosola",
  "Mosolce",
  "Moxacron",
  "Moxadon",
  "Moxagos",
  "Mozagol",
  "Mozagos",
  "Mozala",
  "Mozara",
  "Mozaris",
  "Mozarock",
  "Mozaros",
  "Mystagos",
  "Mystal",
  "Mystala",
  "Mystalar",
  "Mystalas",
  "Mystalia",
  "Mystaloa",
  "Mystaloar",
  "Mystaloas",
  "Mystalon",
  "Mystalora",
  "Mystalore",
  "Mystalos",
  "Mystar",
  "Mystara",
  "Mystaros",
  "Mystaroth",
  "Mystea",
  "Mysteral",
  "Mystereal",
  "Mystereon",
  "Mystereos",
  "Mysteron",
  "Mysteros",
  "Mysteroth",
  "Mystesia",
  "Mysteus",
  "Mystica",
  "Mysticles",
  "Mysticon",
  "Mysticos",
  "Mystigal",
  "Mystigos",
  "Mystoica",
  "Mystola",
  "Mystonium",
  "Mystonius",
  "Mystopia",
  "Mystopion",
  "Mystoral",
  "Mystoria",
  "Mystoris",
  "Mystoros",
  "Mystoroth",
  "Mythadon",
  "Mythagos",
  "Mythagoth",
  "Mythalore",
  "Mythalos",
  "Mythara",
  "Mytharis",
  "Mytharos",
  "Mythazar",
  "Mythazon",
  "Mytheros",
  "Mythica",
  "Mythicles",
  "Mythicos",
  "Mythigal",
  "Nataela",
  "Natalos",
  "Natar",
  "Natara",
  "Nataris",
  "Nataron",
  "Nataros",
  "Nataroth",
  "Nautar",
  "Nautazar",
  "Nautir",
  "Nozala",
  "Nozalos",
  "Nuala",
  "Nualos",
  "Nuara",
  "Nuaros",
  "Onquan",
  "Ozaphol",
  "Ozaphora",
  "Pholce",
  "Phosia",
  "Phosial",
  "Quadal",
  "Quadon",
  "Quanadar",
  "Quanadon",
  "Quanagos",
  "Quanar",
  "Quanara",
  "Quanaros",
  "Quandara",
  "Quandaroth",
  "Quandelon",
  "Quandos",
  "Quantagal",
  "Quantagos",
  "Quantal",
  "Quantalar",
  "Quantalon",
  "Quantara",
  "Quantaris",
  "Quantaron",
  "Quantaros",
  "Quantaroth",
  "Quante",
  "Quanteros",
  "Quanton",
  "Quantos",
  "Quanzala",
  "Quatalar",
  "Quazadal",
  "Quazadar",
  "Quazados",
  "Quazadoth",
  "Quazagos",
  "Quazala",
  "Quazalos",
  "Quazar",
  "Quazaros",
  "Quazoa",
  "Quazora",
  "Quosis",
  "Raqualon",
  "Raquan",
  "Raquanar",
  "Rodagos",
  "Rodante",
  "Rodara",
  "Rodaroth",
  "Rodela",
  "Rodir",
  "Roqual",
  "Roquan",
  "Roquanil",
  "Roquanos",
  "Roquanoth",
  "Rowana",
  "Satar",
  "Satara",
  "Sataris",
  "Sataron",
  "Sataros",
  "Sataroth",
  "Satela",
  "Scaladar",
  "Scalados",
  "Scaladoth",
  "Scalagos",
  "Scalar",
  "Scalaris",
  "Scalaros",
  "Scalaroth",
  "Scalon",
  "Scapagos",
  "Scapicos",
  "Shoala",
  "Shoalon",
  "Shoalos",
  "Shocles",
  "Shocoloth",
  "Shodal",
  "Shodan",
  "Shodanos",
  "Shodath",
  "Shogal",
  "Shogala",
  "Shogalon",
  "Shogalore",
  "Shogalos",
  "Shogara",
  "Shogaros",
  "Shogaroth",
  "Shohana",
  "Shohara",
  "Shoqualon",
  "Shoqualos",
  "Shoqualoth",
  "Shoquan",
  "Shozagol",
  "Shozagos",
  "Shozal",
  "Shozala",
  "Shozalore",
  "Shozalos",
  "Shozana",
  "Shozar",
  "Shozara",
  "Shozaron",
  "Shozaros",
  "Shozea",
  "Shozeas",
  "Shozegos",
  "Shozeil",
  "Shozera",
  "Shozeros",
  "Shozeus",
  "Shozir",
  "Shozoa",
  "Shozoar",
  "Shozoca",
  "Shozola",
  "Shozolagos",
  "Shozolar",
  "Shozolon",
  "Shozosis",
  "Staragol",
  "Staragos",
  "Stelladar",
  "Stelladon",
  "Stellador",
  "Stellados",
  "Stelladoth",
  "Stellagos",
  "Stellamance",
  "Stellante",
  "Stellantos",
  "Stellara",
  "Stelleas",
  "Stelleos",
  "Stelleros",
  "Stellescape",
  "Stellscera",
  "Stellus",
  "Stolagos",
  "Sualara",
  "Sualia",
  "Sudal",
  "Sudalos",
  "Sudamos",
  "Sudara",
  "Sudaros",
  "Sudaroth",
  "Sudil",
  "Sudir",
  "Sudira",
  "Sudiria",
  "Sudiros",
  "Sudoa",
  "Sudomance",
  "Sudora",
  "Sudoros",
  "Sudoscape",
  "Sudoza",
  "Sudozal",
  "Suhala",
  "Suhan",
  "Suragos",
  "Talacles",
  "Taladir",
  "Taladon",
  "Talados",
  "Talagon",
  "Talagos",
  "Talakron",
  "Talantos",
  "Talapica",
  "Talapicos",
  "Talaris",
  "Talaroq",
  "Talaros",
  "Talascar",
  "Talascos",
  "Talastar",
  "Talawan",
  "Talazar",
  "Talazoa",
  "Talazoar",
  "Talazora",
  "Talazoth",
  "Talboa",
  "Talontis",
  "Talora",
  "Taloroth",
  "Talwatha",
  "Taquala",
  "Taqualos",
  "Tascaros",
  "Tazala",
  "Tazalos",
  "Tsuala",
  "Tsualadar",
  "Tsuara",
  "Tsudania",
  "Tsukron",
  "Tsuonde",
  "Tsuquan",
  "Tsurana",
  "Tsuroza",
  "Uayala",
  "Uayalon",
  "Udawana",
  "Udazala",
  "Udazar",
  "Udazoa",
  "Wodala",
  "Wodalon",
  "Wodalos",
  "Wodan",
  "Wodana",
  "Wodanos",
  "Wodante",
  "Wodantos",
  "Wodar",
  "Wodara",
  "Wodaron",
  "Wodaros",
  "Wodaroth",
  "Wodir",
  "Wodiros",
  "Wondagos",
  "Wondala",
  "Wondalore",
  "Wondaloris",
  "Wondalos",
  "Wondaloth",
  "Wondar",
  "Wondara",
  "Wondaris",
  "Wondarol",
  "Wondaros",
  "Wondaroth",
  "Wondaya",
  "Wondayon",
  "Wondera",
  "Wonderil",
  "Wondermance",
  "Wondermar",
  "Wonderon",
  "Wonderos",
  "Wondoa",
  "Wondocon",
  "Wondoica",
  "Wondolar",
  "Wondor",
  "Wondozar",
  "Yondalore",
  "Yondalos",
  "Yondara",
  "Yondaros",
  "Yondola",
  "Yondolan",
  "Yondoloth"
]

module.exports = router;
