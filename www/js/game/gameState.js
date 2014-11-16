﻿/// <reference path="fly.ts"/>
/// <reference path="state.ts"/>
/// <reference path="app.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GameState = (function (_super) {
    __extends(GameState, _super);
    function GameState() {
        _super.apply(this, arguments);
        this.maxLeft = window.innerWidth;
        this.maxTop = window.innerHeight;
        this.startScore = 0;
        this.startTime = 20;
        this.scoreCounter = this.startScore;
        this.timeCounter = this.startTime;
        this.gameLoopCounter = 0;
        this.fps = 20;
        this.numOfFlies = 10;
        this.scoreDiv = document.getElementById("scoreCounter");
        this.timeDiv = document.getElementById("timeCounter");
        this.stateName = "gameState";
        // classname for divs that need to be destroyed
        // during exit (instead of just hidden)
        this.temporaryDivsClass = "gameStateTemporary";
    }
    GameState.Instance = function () {
        if (typeof GameState.instance === "undefined") {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    };

    GameState.prototype.Enter = function (app) {
        this.scoreCounter = this.startScore;
        this.timeCounter = this.startTime;
        this.gameLoopCounter = 0;
        this.flies = [];

        var html = document.getElementsByClassName(this.stateName);
        for (var i = 0; i < html.length; i++) {
            html[i].style.display = "inline";
        }

        this.updateScore();
        this.updateTime();

        var instance = GameState.Instance();
        instance.app = app;
        for (var f = 0; f < instance.numOfFlies; f++) {
            instance.flies.push(new Fly());
        }

        instance.intervalId = setInterval(instance.run, 1000 / instance.fps);
    };

    GameState.prototype.Exit = function (app) {
        var html = document.getElementsByClassName(this.stateName);
        for (var i = 0; i < html.length; i++) {
            html[i].style.display = "none";
        }

        var temporaryDivs = document.getElementsByClassName(this.temporaryDivsClass);
        for (var i = temporaryDivs.length - 1; i >= 0; i--) {
            temporaryDivs[i].parentNode.removeChild(temporaryDivs[i]);
        }
    };

    GameState.prototype.OnPause = function (app) {
        var instance = GameState.Instance();
        clearInterval(instance.intervalId);
    };

    GameState.prototype.OnResume = function (app) {
        var instance = GameState.Instance();
        if (this.timeCounter > 0) {
            instance.intervalId = setInterval(instance.run, 1000 / instance.fps);
        }
    };

    GameState.prototype.OnBack = function (app) {
        app.ChangeState(HomeState.Instance());
    };

    GameState.prototype.score = function () {
        this.scoreCounter++;
        this.updateScore();
    };

    GameState.prototype.confirmDialog = function () {
        var instance = GameState.Instance();
        this.app.ChangeState(HomeState.Instance());
    };

    GameState.prototype.secondElapse = function () {
        this.timeCounter--;
        this.updateTime();

        if (this.timeCounter === 0) {
            var instance = GameState.Instance();
            clearInterval(instance.intervalId);
            navigator.notification.alert("Final Score: " + instance.scoreCounter, this.confirmDialog, "Game Over", "Done");
        }
    };

    GameState.prototype.updateScore = function () {
        this.scoreDiv.innerHTML = this.scoreCounter.toString();
    };

    GameState.prototype.updateTime = function () {
        this.timeDiv.innerHTML = this.timeCounter.toString();
    };

    GameState.prototype.run = function () {
        var instance = GameState.Instance();
        var deadFlies = 0;
        for (var f = instance.flies.length - 1; f >= 0; f--) {
            var fly = instance.flies[f];
            if (fly.healthRemaining > 0) {
                fly.move();
            } else {
                instance.score();
                fly.die();
                instance.flies[f] = new Fly();
            }
        }

        instance.updateScore();

        instance.gameLoopCounter++;
        if (instance.gameLoopCounter > instance.fps) {
            instance.gameLoopCounter = 0;
            instance.secondElapse();
        }
    };
    return GameState;
})(State);
