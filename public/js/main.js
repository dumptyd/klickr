var socket;
var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) 
  isMobile = true;

var logEnabled = false;
var consoleLog = function(){
  if(logEnabled){
    console.log.apply(null,arguments);
  }
};

new Vue({
  el: '#app',
  ready: function () {
    //Initialize setInterval for calculating click frequency and score
    var _this = this;
    setInterval(function(){
      _this.clickFrequency = _this.timestamp*2;
      _this.stats.score+= Math.floor((_this.timestamp/2)*_this.stats.multiplier);
      _this.timestamp = 0;
    }, 500);
    
    //show enter name dialog and connect to socket
    swal({
      title: "Klickr!",
      text: "Enter your name:",
      type: "input",
      closeOnConfirm: true,
      animation: "slide-from-top",
      inputPlaceholder: "Your name"
    },
    function(inputValue){
      _this.nameToConnectWith = inputValue;
      socket = io('/', {query: 'nameToConnectWith='+ _this.nameToConnectWith});
      socket.on('connect', function(){
        _this.socketid = socket.id;
      });
      
      //has {totalPlayers, players, multipliers}
      socket.on('meta', function(data){
        consoleLog('meta');
        _this.totalPlayers = data.totalPlayers;
        _this.players = data.players;
        _this.multipliers = data.bonusId.map(function(e){
          e.x = (e.x/100) * $('#app').width();
          e.y = (e.y/100) * $('#app').height();
          return e;
        });
      });
      
      //Happens everytime a client (except self) clicks on #app.
      //has {cords: {x,y}, name, id} of the client that clicked. coords are in ratio form.
      socket.on('click', function(data){
        consoleLog('click');
        var x = (data.coords.x * $('#app').width());
        var y = (data.coords.y * $('#app').height());
//        var index = _this.playerPosition.findIndex(function(e){
//          return e.id == data.id; 
//        });
//        
//        if(index==-1){
          _this.playerPosition.push({
            x: x,
            y: y,
            name: data.name,
            id: data.id
          });
//        }
        
//        if(!_this.playerNamesToShow.hasOwnProperty(data.id)){
//          _this.playerNamesToShow[data.id] = 1;
//        }
//        else {
//          _this.playerNamesToShow[data.id]++;
//        }
        var id = data.id;
        $("#app").ripple({x:x, y:y, diameter:70});
        setTimeout(function(){
//          if(_this.playerNamesToShow[id]>1){
//            _this.playerNamesToShow[id]--;
//            return;
//          }
//          _this.playerNamesToShow[id] = 0;
          var index = _this.playerPosition.findIndex(function(e){
            return e.id == id; 
          });
          if(index!=-1){
            _this.playerPosition.splice(index, 1);
          }
        },1000, id);
        
      });
      
      //a new multiplier bonus has been generated.
      //has {x, y} coordinates in percentage form.
      socket.on('multiplier', function(data){
        consoleLog('multiplier');
        var mulData = data;
        mulData.x = (data.x/100) * $('#app').width();
        mulData.y = (data.y/100) * $('#app').height();
        _this.multipliers.push(mulData);
      });
      
      // for score and multiplier updates
      socket.on('stats', function(data){
        _this.stats = data.stats;
      });
      
      //if someone (including self) clicks on the multiplier
      socket.on('multiplierClicked', function(data){
        consoleLog('mclicked');
        var index = _this.multipliers.findIndex(function(elem){
          return elem.bonusId == data.bid;
        });
        if(index!=-1){
          _this.multipliers.splice(index,1);
        }
      });
      
    });
    
  },
  data: {
    totalPlayers: 0,
    players: [],
    timestamp: 0,
    clickFrequency: 0,
    nameToConnectWith: '',
    playerPosition: [],
    socketid: '',
    multipliers: [],
    isMobile: isMobile,
    lastClickTimestamp: new Date(),
    stats: {
      multiplier: 1, 
      score: 0
    }
//    playerNamesToShow: {}
  },
  methods: {
    calcFreq: function(e){
      if(!e.isTrusted){
        console.log('Really?');
        return;
      }
      this.timestamp++;
      var currClickTimestamp = new Date();
      var diffInSeconds = (currClickTimestamp - this.lastClickTimestamp) / 1000;
      var broadcast = true; // broadcast this click to all clients
      if(diffInSeconds < 0.5){
        broadcast = false;
      }
      if(diffInSeconds >= 0.5){
        this.lastClickTimestamp = currClickTimestamp;
      }
      var stats = this.stats;
      var x = e.clientX / $('#app').width();
      var y = e.clientY / $('#app').height();
      socket.emit('click', {x:x, y:y, stats:stats, broadcast: broadcast});
    },
    clickMultiplier: function(e, bid){
      if(!e.isTrusted){
        console.log('Really?');
        return;
      }
      var index = this.multipliers.findIndex(function(elem){
        return elem.bonusId == bid;
      });
      if(index!=-1){
        this.multipliers.splice(index,1);
      }
      socket.emit('multiplierClicked', {bid:bid});
      this.lastClickTimestamp = new Date();
      var stats = this.stats;
      var x = e.clientX / $('#app').width();
      var y = e.clientY / $('#app').height();
      socket.emit('click', {x:x, y:y, stats:stats, broadcast: true});
    }
  },
  computed: {
    sortedPlayers: function(){
      var arr = this.players.sort(function(a,b){
        return b.score - a.score;
      });
      if(isMobile){
        return arr.slice(0,3);
      }
      else {
        return arr.slice(0,10);
      }
    }
  }
});

$(document).ready(function(){
  $("#app").attachRipple({diameter: 70});
});