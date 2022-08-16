// Define the `nanoApp` module
var nanoApp = angular.module("nanoApp", []);

// Define the `appController` controller on the `nanoApp` module
nanoApp.controller("appController", function appController($scope) {
  $scope.running = false;
  $scope.progress = 0;
  $scope.qualityList = config.QUALITY;
  $scope.TINY_DIR = config.TINY_DIR;
  $scope.intervalIndicator = null;
  $scope.intervalIndicatorLogs = null;
  $scope.logs = [];
  $scope.reset = function () {
    $scope.selectedQuality = $scope.qualityList[0];
    $scope.sourcePath = "";
  };
  $scope.reset();
  $scope.submit = async function () {
    try {
      $scope.progress = 0;
      let selectedQuality =
        typeof $scope.selectedQuality.value === "number" &&
        $scope.selectedQuality.value > 0
          ? $scope.selectedQuality.value
          : false;
      let sourcePath =
        $scope.sourcePath != undefined && $scope.sourcePath.trim() != ""
          ? $scope.sourcePath.trim()
          : false;
      if (selectedQuality && sourcePath) {
        let params = {
          path: sourcePath,
          quality: selectedQuality,
        };
        $scope.running = true;
        console.log("params", params);
        $scope.getProgress();
        $scope.getLogs();
        let response = await window.electronAPI.convertPhoto(params);
        $.alert({
          useBootstrap: false,
          boxWidth: "300px",
          title: "Completed!",
          type: "success",
          content: "All Images Compress Successfully",
        });
        $scope.running = false;
        $scope.$apply(function () {
          $scope.progress = 100;
        });
        clearInterval($scope.intervalIndicator);
        clearInterval($scope.intervalIndicatorLogs);
        console.log(response);
      } else {
        $.alert({
          useBootstrap: false,
          boxWidth: "300px",
          title: "Warning!",
          content: "Please Choose Input Properly",
        });
      }
    } catch (error) {
      $scope.running = false;
      clearInterval($scope.intervalIndicator);
      clearInterval($scope.intervalIndicatorLogs);
      console.log(error);
      $.alert({
        useBootstrap: false,
        boxWidth: "300px",
        title: "Error!",
        type: "error",
        content: "Sorry ! Unable to process. Try again later",
      });
    }
  };

  $scope.getProgress = function () {
    if ($scope.running) {
      $scope.intervalIndicator = setInterval(async () => {
        let response = await window.electronAPI.getProgress();
        $scope.$apply(function () {
          $scope.progress = response;
        });
      }, 300);
    }
  };

  $scope.getLogs = function () {
    if ($scope.running) {
      $scope.intervalIndicatorLogs = setInterval(async () => {
        let response = await window.electronAPI.getLogs();
        $scope.$apply(function () {
          $scope.logs = response;
        });
      }, 300);
    }
  };
});
