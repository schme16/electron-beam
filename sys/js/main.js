angular.module('2015-1510 - M - ENRICH GOAL: JAVASCRIPT SERVER SIDE RESEARCH', ['Scope.safeApply'])

/*The controllers*/
.controller('master', function master($scope) {
	m = $scope;

})




/*Directives*/
.directive('touch', function () {
	return function (scope, element, attrs) {
		element.bind('pointerdown', function () {
			try {
				scope.$apply(attrs.touch);
			} catch (e) {}
		});
	};
});
