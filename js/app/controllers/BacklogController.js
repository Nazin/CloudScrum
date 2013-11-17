'use strict';

cloudScrum.controller('BacklogController', function BacklogController($scope, $rootScope) {

    $rootScope.loading = false;//todo hide after loading stories from google api

    $scope.planning = false;
    $scope.stories = [
        {title: 'Story 1', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', estimate: 2},
        {title: 'Story 2', description: 'Phasellus bibendum gravida diam, sed molestie eros imperdiet eu.', estimate: 5},
        {title: 'Story 3', description: 'Morbi erat purus, interdum eu congue at, pellentesque tempor neque.', estimate: 2},
        {title: 'Story 4', description: 'Ut ultrices sem vel justo egestas tempus.', estimate: 1},
        {title: 'Story 5', description: 'Vestibulum ipsum sapien, vulputate a cursus a, blandit ut libero.', estimate: 8}
    ];

    $scope.sortableOptions = {
        stop: function(e, ui) {

            var sp = 0;

            for (var i = 0; i < $scope.stories.length; i++) {
                if (typeof $scope.stories[i].ruler === 'undefined') {
                    sp += $scope.stories[i].estimate;
                } else {
                    $scope.stories[i].points = sp;
                    $('.backlog-story:eq(' + i + ')').find('.points').text(sp);//TODO add label with iteration number on left side
                    sp = 0;
                }
            }
        },
        axis: 'y',
        cancel: '.disabled'
    };

    $scope.planRelease = function() {

        $scope.planning = !$scope.planning;

        if ($scope.planning) {
            $scope.stories.unshift({ruler: true, points: 0});
        } else {
            //todo remove all rulers
        }
    };

    //TODO move to some other place
    Array.prototype.move = function(oldIndex, newIndex) {
        if (newIndex >= this.length) {
            var k = newIndex - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
        return this;
    };
});