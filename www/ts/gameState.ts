﻿/// <reference path="fly.ts"/>
/// <reference path="flyFactory.ts"/>
/// <reference path="state.ts"/>
/// <reference path="app.ts"/>

class GameState extends State{
    public maxLeft: number = window.innerWidth;
    public maxTop: number = window.innerHeight;
    private startLevel: number = 1;
    private currentLevel: number = this.startLevel;
    private startTime: number = 20;
    private timeCounter: number = this.startTime;
    private gameLoopCounter: number = 0;
    private fps: number = 20;
    private flies: Fly[];
    private numOfFlies: number = 8;
    private timeDiv: HTMLElement = document.getElementById("timeCounter");
    private levelDiv: HTMLElement = document.getElementById("levelCounter");
    private stateName: string = "gameState";
    // classname for divs that need to be destroyed 
    // during exit (instead of just hidden)
    private temporaryDivsClass: string = "gameStateTemporary";
    private static instance: GameState;
    private intervalId: any;
    private app: App;

    public static Instance(): GameState {
        if (typeof GameState.instance === "undefined") {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    public Enter(app: App) {
        this.timeCounter = this.startTime;
        this.gameLoopCounter = 0;
        this.flies = [];


        var html = document.getElementsByClassName(this.stateName);
        for (var i = 0; i < html.length; i++) {
            (<HTMLDivElement>html[i]).style.display = "inline";
        }

        this.updateTime();

        var instance = GameState.Instance();
        instance.app = app;
        /*for (var f = 0; f < instance.numOfFlies; f++) {
            instance.flies.push(FlyFactory.CreateFly(instance.currentLevel));
        }*/
        instance.flies = FlyFactory.CreateFliesForLevel(1);

        this.levelDiv.innerHTML = this.currentLevel.toString();

        instance.intervalId = setInterval(instance.run, 1000 / instance.fps);
    }

    public Exit(app: App) {
        var html = document.getElementsByClassName(this.stateName);
        for (var i = 0; i < html.length; i++) {
            (<HTMLDivElement>html[i]).style.display = "none";
        }

        var temporaryDivs = document.getElementsByClassName(this.temporaryDivsClass);
        for (var i = temporaryDivs.length-1; i >= 0; i--) {
            (<HTMLDivElement>temporaryDivs[i]).parentNode.removeChild(temporaryDivs[i]);
        }
    }

    public OnPause(app: App) {
        var instance = GameState.Instance();
        clearInterval(instance.intervalId);
    }

    public OnResume(app: App) {
        var instance = GameState.Instance();
        if (this.timeCounter > 0) {
            instance.intervalId = setInterval(instance.run, 1000 / instance.fps);
        }
    }

    public OnBack(app: App) {
        app.ChangeState(HomeState.Instance());
    }

    private timeUpDialog(index: number) {
        //index 1 = Try Again, 2 = Exit, 0 = no button
        var instance = GameState.Instance();
        if (index === 1) {
            // re-try the level
            this.app.ChangeState(GameState.Instance());
        } else if (index === 2) {
            this.app.ChangeState(HomeState.Instance());
        } else {
            // lets just let user re-try the level
            this.app.ChangeState(GameState.Instance());
        }
    }

    private levelCompleteDialog(index: number) {
        // update the level
        GameState.instance.currentLevel++;

        // index 1 = Next Level, 2 = Exit
        var instance = GameState.Instance();
        if (index === 1) {
            this.app.ChangeState(GameState.Instance());
        } else if (index === 2) {
            this.app.ChangeState(HomeState.Instance());
        } else {
            // assume user wants the next level
            this.app.ChangeState(GameState.Instance());
        }   
    }

    public secondElapse() {
        this.timeCounter--;
        this.updateTime();

        if(this.timeCounter === 0 && this.flies.length > 0) {
            var instance = GameState.Instance();
            clearInterval(instance.intervalId);
            (<any>navigator).notification.confirm(
                instance.flies.length + " flies remaining." ,
                this.timeUpDialog,
                "Game Over",            
                ["Try Again", "Exit"]  
            );
        }
    }

    private updateTime() {
        this.timeDiv.innerHTML = this.timeCounter.toString();
    }

    private run () {
        var instance = GameState.Instance();
        var deadFlies: number = 0;
        for (var f = instance.flies.length - 1; f >= 0; f--) {
            var fly = instance.flies[f];
            if (fly.healthRemaining > 0) { 
                fly.move();
            } else {
                fly.die();
                instance.flies.splice(f, 1);
            }
        }

        if (instance.flies.length === 0) {
            clearInterval(instance.intervalId);
            (<any>navigator).notification.confirm(
                "Level Completed",
                instance.levelCompleteDialog,
                "Great Job!",            
                ["Next Level", "Exit"]  
            );
        } 

        instance.gameLoopCounter++;
        if (instance.gameLoopCounter > instance.fps) {
            instance.gameLoopCounter = 0;
            instance.secondElapse();
        }

    }
}
