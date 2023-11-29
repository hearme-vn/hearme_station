import { Injectable } from '@angular/core';
 
@Injectable()
export class YTPlayerService {
	
	static load_YT_API=  false;
	
	container = null;
	ready = false;
	player = null
	playerId = null;
	videoId = null;
	videoTitle = null;
	playerHeight = '100%';
	playerWidth = '100%';
 
	constructor() {
		this.load_YTLibrary();
	}

	load_YTLibrary() {
		if (!YTPlayerService.load_YT_API) {			
			// Init Google API
			let tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			let firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			
			YTPlayerService.load_YT_API = true;
		}
	}

	bindPlayer(elementId): void {
		this.playerId = elementId;
	};

	createPlayer(): void {
		let stateChange = this.onPlayerStateChange;
		
		return new window['YT'].Player(this.playerId, {
			height: this.playerHeight,
			width: this.playerWidth,
			videoId: this.videoId,
			playerVars: {
				rel: 0,
				showinfo: 0,
				fs: 0,
				controls: 0,
				loop: 1,
				playlist: this.videoId,
				playsinline: 1
			},
			events: {
				'onError': this.onPlayerError,
				'onReady': this.onPlayerReady,
				'onStateChange': stateChange.bind(this)
			}			
		});
	}

	loadPlayer(): void {
		if (this.ready && this.playerId) {
			if (this.player) {
				this.player.destroy();
			}
			this.player = this.createPlayer();
		}
	}
	
	// 4. The API will call this function when the video player is ready.
	onPlayerReady(event) {
		event.target.playVideo();
	}

	// 5. The API calls this function when the player's state changes.
	onPlayerStateChange(event) {
		let YT = window['YT'];
		if (this.playerId && event.data == YT.PlayerState.PLAYING) {
			let ytHTMLElem = document.getElementById(this.playerId);
			if (ytHTMLElem) {
				let idx = Number(ytHTMLElem.style.zIndex);
				if (idx>1000)	idx = 0;
				ytHTMLElem.style.zIndex = String(idx + 1);

				// let url = ytHTMLElem.getAttribute("src");
				// ytHTMLElem.setAttribute("src", url + "?wmode=transparent");
			}
			
		}
	}

	stopVideo() {
		if (this.player)
			try {
				this.player.stopVideo();
			}
			catch(e){
				console.log("Stop video error: ", e.message)
			}			
	}

	playVideo() {
		if (this.player) {
			this.player.playVideo();
		}
	}

	onPlayerError(error) {
		console.log("error on the video id.", error);
	}	

	setupPlayer(container, videoId) {
		this.container = container;
		this.videoId = videoId;
		//we need to check if the api is loaded
		window['onYouTubeIframeAPIReady'] = () => {
			if (window['YT']) {
				this.ready = true;
				this.bindPlayer(container);
				this.loadPlayer();
			}
		};
		if (window['YT'] && window['YT'].Player) {
			this.ready = true;
			this.bindPlayer(container);
			this.loadPlayer();
		}
	}

	// DEPRECATED
	launchPlayer(id): void {
		this.videoId = id;
		return this.player;
	}

	unloadPlayer() {
		if (!this.player)	return;
		this.stopVideo();

		let div = document.createElement('div');
		div.id = this.container;
		let iframe = document.getElementById(this.container);
		iframe.parentNode.replaceChild(div, iframe);
		this.player = null;
	}

	// Reload new video for current player
	reloadVideo(videoId) {
        this.unloadPlayer();
        this.setupPlayer(this.container, videoId);
	}
}