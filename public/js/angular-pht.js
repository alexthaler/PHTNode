var phtModule = angular.module('phtModule', []);

phtModule.factory('gameService', function($rootScope) {
    return {
        joinNewGame: function(game) {
            $rootScope.$broadcast('joinNewGame', game);
        },
        refreshGameList: function() {
            $rootScope.$broadcast('refreshGameListDisplay');
        }
    };
});

phtModule.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {  
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        },
        joinGame: function (game) {
            console.log('fooo dumb game ' + game.gameId);
            $rootScope.$broadcast('connectToGame', socket, game);
        }
    };
});

function GameClockController($scope, $timeout, $http, gameService, socket) {

    $scope.game = {}; 
    $scope.gameClockSeconds = 0;
    $scope.gameClockMinutes = 0;
    $scope.paused = false;

    var myTimeout = undefined;


    $scope.updateDisplay = function() {
        var currtime = moment();
        $scope.gameClockSeconds = zeroPad((currtime.diff(moment($scope.game.started), 'seconds') % 60) + 1, 2);
        $scope.gameClockMinutes = currtime.diff(moment($scope.game.started), 'minutes');
        if (!$scope.paused) {
            myTimeout = $timeout($scope.updateDisplay, 1000);    
        } else {
            myTimeout = undefined;
        }
    }

    $scope.resumeGame = function() {
        $http.put('/api/game/' + $scope.game.gameId + '/resume').success(function(){
            resumeDisplay();
        });
    }

    $scope.pauseGame = function() {
        $http.put('/api/game/' + $scope.game.gameId + '/pause').success(function(){
            pauseDisplay();    
        });
    }

    function pauseDisplay() {
        $scope.paused = true;
        stopTimeout();  
    }

    function resumeDisplay() {
        $scope.paused = false;    
        startTimeout();
    }

    $scope.cancelGame = function() {
        stopTimeout();        
        $scope.game = {};
        $scope.gameClockSeconds = 0;
        $scope.gameClockMinutes = 0;
    }

    function zeroPad(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    }

    $scope.$on('joinNewGame', function(event, game) {
        $scope.cancelGame();
        $scope.game = game;
        $scope.paused = game.paused;
        startTimeout();    
    });

    socket.on('pauseGame', function(data) {
        if(!$scope.paused) {
            console.log('pause alert received');
            pauseDisplay();
        }
    });

    socket.on('resumeGame', function(data) {
        if($scope.paused) {
            console.log('resume alert received');
            resumeDisplay();
        }
    });

    function stopTimeout() {
        if(myTimeout) {
            $timeout.cancel(myTimeout);
            myTimeout = undefined;
        }            
    }

    function startTimeout() {
        if(!myTimeout) {
            myTimeout = $timeout($scope.updateDisplay, 1000);
        }            
    }

}

function GameController($scope, $http, gameService, socket) {

    $scope.currentGames = []; 

    $http.put('/api/games/removecompleted').success(function() {});

    $scope.$on('refreshGameListDisplay', function() {
        var newGameList = [];
        console.log('updating list of games');
        $http.get('/api/games').success(function(data) {
            for (var i=0; i<data.length; i++) {
                if(data[i].name) {
                    newGameList.push(data[i]);
                }
            }
        });
        $scope.currentGames = newGameList;
    });

    $scope.$on('connectToGame', function(event, socket, game) {
        console.log('sessionId from callback ' + socket.socket.sessionid);
        console.log('blah game ' + game);
        $http.put('/api/game/' + game.gameId + '/join', {playerId:socket.socket.sessionid})
    });

    $scope.joinGame = function() {
        var e = document.getElementById('currentGames');
        var game = $scope.currentGames[e.selectedIndex];
        socket.joinGame(game);
        gameService.joinNewGame(game);
    }

    $scope.createGame = function(gameName) {
        $http.post('/api/game', {name: gameName}).success(function(game) {
            gameService.joinNewGame(game);
            gameService.refreshGameList();
        });
        $scope.newGameName = '';
    }

    gameService.refreshGameList();

    socket.on('gameAlert', function(data) {
        alert(data.msg);
    });

}
