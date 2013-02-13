var phtModule = angular.module('phtModule', []);
phtModule.factory('gameService', function($rootScope) {
    return {
        updateGame: function(game) {
            $rootScope.$broadcast('updateGameInformation', game);
        }
    };
});

function GameClockController($scope, $timeout, gameService) {

    $scope.game = {}    
    $scope.gameClockSeconds = 1;
    $scope.gameClockMinutes = 0;

    var myTimeout = 0;

    $scope.onTimeout = function(){
        var currtime = moment();
        $scope.gameClockSeconds = zeroPad((currtime.diff(moment($scope.game.started), 'seconds') % 60) + 1, 2);
        $scope.gameClockMinutes = currtime.diff(moment($scope.game.started), 'minutes');
        myTimeout = $timeout($scope.onTimeout, 1000);
    }

    $scope.resumeGame = function() {
        myTimeout = $timeout($scope.onTimeout, 1000);
    }

    $scope.pauseGame = function() {
        $timeout.cancel(myTimeout);
    }

    function zeroPad(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    }

    $scope.$on('updateGameInformation', function(event, game) {
        $scope.game = game;
        myTimeout = $timeout($scope.onTimeout, 1000);
    });

}

function GameController($scope, $http, gameService) {

    $scope.currentGames = []; 

    $http.put('/api/games/removecompleted').success(function() {});

    function refreshGameList() {
        $http({method: 'GET', url: '/api/games'}).
            success(function(data, status, headers, config) {
                for (var i=0; i<data.length; i++) {
                    if(data[i].name) {
                        $scope.currentGames.push(data[i]);
                    }
                }
            }).
            error(function(data, status, headers, config) {
                currentGames = [{name:"Error getting games!!"}];
            });
    }

    $scope.joinGame = function() {
        var e = document.getElementById('currentGames');
        gameService.updateGame($scope.currentGames[e.selectedIndex]);
    }

    $scope.createGame = function(gameName) {
        $http.post('/api/game', {name: gameName}).success(function(game) {
            gameService.updateGame(game);
        });
    }

    refreshGameList();

}

GameClockController.$inject = ['$scope', '$timeout', 'gameService'];                
GameController.$inject = ['$scope', '$http', 'gameService'];