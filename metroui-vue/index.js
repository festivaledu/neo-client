Array.prototype.firstObject = function() {
	return this[0];
}
Array.prototype.lastObject = function() {
	return this[this.length - 1];
}




var findInRow = (node) => {
	var i = 0;
	while (node = node.previousSibling) {
		if (node.nodeType === 1) { ++i; }
	}

	return i;
}

var cumulativeOffset = (element) => {
	var top = 0, left = 0;
	do {
		top += element.offsetTop || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element);

	return {
		top: top,
		left: left
	};
};

let ContentDialogResult = {
	None: 0,
	Primary: 1,
	Secondary: 2
};



var metroUI = window.metroUI = {};
metroUI.views = {};


metroUI.View = class {
	constructor(element, params) {
		let view = this;
		view.container = element;

		view.params = {
			isPrimaryView: false
		};
		for (var param in params) {
			view.params[param] = params[param];
		}

		if (view.params.isPrimaryView) {
			view.container.classList.add("view-active");
		}

		view._currentPage = null;
		view.pages = {};
		view._items = {};
		view._history = [];

		view.container.querySelectorAll(".pages > .page").forEach((item, index) => {
			if (item.hasAttribute("data-page-id")) {
				view.pages[item.getAttribute("data-page-id")] = new metroUI.Page(item, {
					parentView: view,
					isPrimaryPage: index == 0
				});

				if (index == 0) {
					view._currentPage = view.pages[item.getAttribute("data-page-id")];
					view._history.push(item.getAttribute("data-page-id"));
				}
			}
		});
	}

	navigate(pageName, _options) {
		const view = this;

		var options = {
			url: null,
			addHistory: true
		}
		for (var option in _options) {
			options[option] = _options[option];
		}

		let page = view.pages[pageName];
		if (page) {
			if (page.isVisible) return;
			page.show();
			view._currentPage = page;

			if (options.addHistory) {
				view._history.push(pageName);
			}
		}/* else if (options.url) {
			_metroUIInstance.get(options.url, (responseText) => {
				var parsedPage = (new DOMParser()).parseFromString(responseText, "text/html").body.children[0];
				view.container.appendChild(parsedPage);
				view.pages[pageName] = new metroUI.Page(parsedPage, {
					parentView: view
				});

				view.pages[pageName].show();
				view._currentPage = view.pages[pageName];

				if (options.addHistory) {
					view._history.push(pageName);
				}
			})
		}*/
	}

	goBack() {
		const view = this;
		if (view._history.length > 1) {
			view._currentPage.hide();

			let lastPage = view.pages[view._history[view._history.length - 2]];
			if (lastPage) {
				lastPage.show();

				view._history.pop();
			}
		}
	}

	show() {
		let view = this;
		document.querySelectorAll(".views .view").forEach((item) => {
			if (item == view.container) {
				item.classList.add("view-active");
			} else {
				item.classList.remove("view-active");
			}
		});
	}

	hide() {
		this.container.classList.remove("view-active");
	}

	querySelector(query) {
		return this.container.querySelector(query);
	}
	querySelectorAll(query) {
		return this.container.querySelectorAll(query);
	}
}

metroUI.Page = class {
	constructor(element, params) {
		let page = this;
		page.container = element;

		page.params = {
			parentView: null,
			parentPage: null,
			isPrimaryPage: false,
			title: null
		};
		for (var param in params) {
			page.params[param] = params[param];
		}
		
		if (page.params.isPrimaryPage) {
			page.container.classList.add("page-active");
		}
		
		page._scrollTop = null;
	}
	
	show() {
		let page = this;

		if (page.params.parentPage) {
			page.params.parentPage.querySelectorAll(".page").forEach((item) => {
				if (item == page.container) {
					item.classList.add("page-active");
				} else {
					item.classList.remove("page-active");
				}
			});
		} else if (page.params.parentView) {
			page.params.parentView.querySelectorAll(".pages > .page").forEach((item) => {
				if (item == page.container) {
					item.classList.add("page-active");
				} else {
					item.classList.remove("page-active");
				}
			});
		}
	}

	hide() {
		this.container.classList.remove("page-active");
	}

	get isVisible() {
		return this.container.classList.contains("page-active");
	}
	
	get pageData() {
		const page = this;
		
		return {
			id: page.container.getAttribute("data-page-id"),
			container: page.container,
			view: page.params.parentView,
			parentPage: page.params.parentPage,
			title: page.params.title
		}
	}

	querySelector(query) {
		return this.container.querySelector(query);
	}
	querySelectorAll(query) {
		return this.container.querySelectorAll(query);
	}
}

metroUI.ContentDialog = class {
	constructor(_title, _content, buttons) {
		const dialog = this;
		
		dialog.background = document.createElement("div");
		dialog.background.className = "content-dialog-background";
		
		dialog.container = document.createElement("div");
		dialog.container.className = "content-dialog";
		
		let content = document.createElement("div");
		content.className = "content";
		dialog.container.appendChild(content);
		
		if (_title.length) {
			let title = document.createElement("h4");
			title.innerHTML = _title;
			content.appendChild(title);
		}
		
		if (_content.length) {
			let parsedHTML = (new DOMParser()).parseFromString(_content, "text/html");
			if (parsedHTML.body.children.length) {
				for (var i=0; i<parsedHTML.body.children.length; i++) {
					content.appendChild(parsedHTML.body.children[i].cloneNode(true));
				}
			} else {
				let contentText = document.createElement("p");
				contentText.innerHTML = _content;
				content.appendChild(contentText);
			}
		}
		
		if (buttons.length) {
			let commands = document.createElement("div");
			commands.className = "commands";
			dialog.container.appendChild(commands);
			
			buttons.forEach((_button, index) => {
				let button = document.createElement("button");
				button.innerHTML = _button.text;
				button.className = _button.primary ? "primary" : "";
				// TODO: Add event listener
				
				button.addEventListener("click", () => {
					if (dialog._promiseResolve) {
						//dialog._promise.resolve(1);
						if (_button.primary) {
							dialog._promiseResolve(ContentDialogResult.Primary);
						} else if (index == buttons.length - 1) {
							dialog._promiseResolve(ContentDialogResult.None);
						} else {
							dialog._promiseResolve(ContentDialogResult.Secondary);
						}
					}
					
					dialog.hide();
				});
				
				commands.appendChild(button);
			});
		}
	}
	
	async showAsync() {
		const dialog = this;
		if (!document.querySelector("div.content-dialog-background")) {
			document.body.appendChild(dialog.background);
		}
		
		document.body.appendChild(dialog.container);
		
		let promise = new Promise((resolve, reject) => {
			dialog._promiseResolve = resolve;
		});
		return promise;
	}
	
	hide() {
		const dialog = this;
		
		dialog.container.classList.add("animate-out");
		if (document.querySelectorAll(".content-dialog").length < 2) {
			document.querySelector(".content-dialog-background").classList.add("animate-out");
		}
		setTimeout(() => {
			document.body.removeChild(dialog.container);
			if (!document.querySelector(".content-dialog")) {
				document.body.removeChild(document.querySelector(".content-dialog-background"));
			}
		}, 400);
	}
}

var Switch = {
	name: "metro-switch",
	props: ["value", "onContent", "offContent"],
	data() {
		return {
			_checked: this.$props.value,
			_onContent: this.$props.onContent ? this.$props.onContent : "On",
			_offContent: this.$props.offContent ? this.$props.offContent : "Off",
		}
	},
	render(h) {
		return (
			<div class="toggle-switch">
				<input type="checkbox" checked={this.$data._checked} id={'randomString'} onChange={this.onChange} ref="input"></input>
				<label for={'randomString'}>
					<p class="item-label" ref="itemLabel"></p>
				</label>
			</div>
		)
	},
	mounted() {
		if (this.$refs["input"].checked) {
			this.$refs["itemLabel"].innerHTML = this.$data._onContent;
		} else {
			this.$refs["itemLabel"].innerHTML = this.$data._offContent;
		}
	},
	methods: {
		onChange(e) {
			this.$data._checked = e.target.checked;
			
			if (e.target.checked) {
				this.$refs["itemLabel"].innerHTML = this.$data._onContent;
			} else {
				this.$refs["itemLabel"].innerHTML = this.$data._offContent;
			}
			
			this.$emit('input', this.$data._checked);
		}
	}
};

var Slider = {
	name: "metro-slider",
	props: ["value", "min", "max", "step", "title"],
	data() {
		return {
			_value: this.$props.value,
			_min: this.$props.min ? this.$props.min : 0,
			_max: this.$props.max ? this.$props.max : 100,
			_step: this.$props.step ? this.$props.step : 1,
			_title: this.$props.title
		}
	},
	render(h) {
		return (
			<div class="slider">
				{this.$props.title &&
					<p class="item-header">{this.$props.title}</p>
				}
				<div class="background">
					<div class="fill" ref="fill"></div>
				</div>
				<input type="range" min={this.$data._min} max={this.$data._max} value={this.$data._value} step={this.$data._step} ref="input" onInput={this.onInput} onMousedown={this.onMouseDown} onMouseup={this.onMouseUp}></input>
				<div class="value" ref="value"></div>
			</div>
		)
	},
	mounted() {
		this.$refs["fill"].style.width = `${this.getValue() * 100}%`;
	},
	methods: {
		onInput(e) {
			this.$refs["fill"].style.width = `${this.getValue() * 100}%`;
			
			this.$refs["value"].style.left = `${this.getValue() * 100}%`;
			this.$refs["value"].style.transform = `translate3d(calc((-50% + 4px) - ${this.getValue() * 8}px), 0, 0)`;
			this.$refs["value"].innerHTML = parseInt(this.$refs["input"].value);
			
			this.$data._value = this.$refs["input"].value;
			this.$emit('input', this.$data._value);
		},
		onMouseDown() {
			this.$refs["value"].classList.add("visible");
			this.$refs["value"].style.left = `${this.getValue() * 100}%`;
			this.$refs["value"].style.transform = `translate3d(calc((-50% + 4px) - ${this.getValue() * 8}px), 0, 0)`;
			this.$refs["value"].innerHTML = parseInt(this.$refs["input"].value);
		},
		onMouseUp() {
			this.$refs["value"].classList.remove("visible");
		},
		getValue() {
			let input = this.$refs["input"];
			return (input.value - input.min) / (input.max - input.min);
		}
	}
};

var ProgressBar = {
	name: "metro-progress-bar",
	props: ["value", "min", "max"],
	data() {
		return {
			_value: this.$props.value,
			_min: this.$props.min ? this.$props.min : 0,
			_max: this.$props.max ? this.$props.max : 100,
		}
	},
	render(h) {
		return (
			<div class="progress">
				<div class="background">
					<div class="fill" ref="fill"></div>
				</div>
				<progress value={this.$data._value} min={this.$data._min} max={this.$data._max} ref="bar" />
			</div>
		)
	},
	mounted() {
		this.$refs["fill"].style.width = `${this.$data._value}%`;
	},
	updated() {
		this.$refs["fill"].style.width = `${this.$data._value}%`;
	},
	watch: {
		value(val) {
			this.$data._value = val;
		}
	}
};

var List = {
	name: "metro-list",
	props: ["value"],
	data() {
		return {
			_value: this.$props.value
		}
	},
	render(h) {
		return (
			<div class="list" onClick={this.onClick}>
				{this.$slots.default}
				<div class="list-inner" ref="list"></div>
			</div>
		)
	},
	mounted() {
		const select = this.$slots.default[0];
		select.children.forEach(item => {
			var listItem = document.createElement("div");
			listItem.classList = "list-item";
			listItem.innerHTML = item.elm.innerText;

			if (item.elm.hasAttribute("selected")) {
				listItem.classList.add("selected");
			}
			if (item.elm.hasAttribute("disabled")) {
				listItem.classList.add("disabled");
			}
			if (item.elm.value) {
				listItem.setAttribute("data-value", item.elm.value);
			}

			this.$refs["list"].appendChild(listItem);
		});
		
		if (select.elm.selectedIndex >= 0) {
			this.$refs["list"].children[select.elm.selectedIndex].classList.add("selected");
			this.$refs["list"].style.transform = `translate3d(0, -${(findInRow(this.$refs["list"].querySelector(".selected")) * 32 + 8)}px, 0)`;
		} else {
			this.$refs["list"].style.transform = "translate3d(0, -8px, 0)";
		}
		
		this.$el.querySelectorAll("div.list-inner div.list-item").forEach((item, index) => {
			item.addEventListener("click", (e) => {
				e.stopPropagation();
				if (item.hasAttribute("disabled")) {
					return;
				}
				
				if (this.$el.classList.contains("open")) {
					this.$el.classList.remove("open");
				}

				if (this.$refs["list"].querySelector(".selected")) {
					this.$refs["list"].querySelector(".selected").classList.remove("selected");
				}

				item.classList.add("selected");
				this.$refs["list"].style.transform = `translate3d(0, -${(findInRow(item) * 32 + 8)}px, 0)`;
				this.$refs["list"].style.top = "";
				
				if (item.hasAttribute("data-value")) {
					this.$data.value = item.getAttribute("data-value");
				} else {
					this.$data.value = null;
				}
				this.$emit('input', this.$data.value);
			});
		});
	},
	methods: {
		onClick(e) {
			if (!this.$el.classList.contains("open")) {
				this.$el.classList.add("open");
			} else {
				return;
			}
			
			var shift = Math.max(findInRow(this.$refs["list"].querySelector(".selected")), 0) * 32 + 8;
			this.$refs["list"].style.transform = `translate3d(0, -${shift}px, 0)`;

			var node = this.$refs["list"];
			while (node) {
				if (node.scrollTop > 0) break;
				if (!node.parentNode) break;
				node = node.parentNode;
			}
			
			let absolutePosTop = (cumulativeOffset(this.$refs["list"]).top - shift) - (parseInt(node.scrollTop) ? node.scrollTop : 0);
			let absolutePosBottom = absolutePosTop + this.$refs["list"].offsetHeight;
			
			if (absolutePosTop < 10) {
				this.$refs["list"].style.top = `${-absolutePosTop + 10}px`;
			} else {
				
				let top = Math.max(absolutePosBottom - (window.innerHeight - 10), 0);
				this.$refs["list"].style.top = `-${top}px`;
			}
			/*var absolutePosTop = (cumulativeOffset(list.list).top - shift) - node.scrollTop + list.list.offsetHeight;
			var top = Math.max(absolutePosTop - (window.innerHeight - 10), 0);
			list.list.style.top = `${top}px`;*/

			e.stopPropagation();
		}
	}
};

var AutoSuggestBox = {
	name: "metro-auto-suggest",
	props: ["value", "placeholder", "data", "maxResults"],
	data() {
		return {
			_value: this.$props.value,
			_data: this.$props.data ? this.$props.data : [],
			_maxResults: this.$props.maxResults ? this.$props.maxResults : 4,
			
			results: []
		}
	},
	render(h) {
		return (
			<div class="auto-suggest">
				<input type="text" value={this.$data._value} placeholder={this.$props.placeholder} ref="input" onInput={this.onInput}></input>
				<div class="items" ref="items">
				{this.$data.results.map(item => {
					return (
						<div class="item" onClick={this._itemClicked}>{item}</div>
					)
				})}
				</div>
			</div>
		)
	},
	mounted() {
		window.addEventListener("click", this._windowClickHandler);
	},
	destroyed() {
		window.removeEventListener("click", this._windowClickHandler);
	},
	methods: {
		onInput(e) {
			this.$data._value = e.target.value;
			this.$emit('input', this.$data._value);
			this.$emit('textChanged', {
				sender: this,
				reason: "userInput"
			});
			
			this._suggestItems();
			setTimeout(() => {
				var node = this.$el;
				while (node) {
					if (node.scrollTop > 0) break;
					node = node.parentNode;
				}

				let absolutePosTop = cumulativeOffset(this.$refs["items"]).top - (node ? node.scrollTop : 0) + this.$refs["items"].offsetHeight;
				if (absolutePosTop >= window.innerHeight) {
					this.$refs["items"].classList.add("top");
				} else {
					this.$refs["items"].classList.remove("top");
				}
			}, 20);
		},
		setDataSource(source) {
			this.$data._data = source;
		},
		_windowClickHandler(e) {
			if (!this.$el.contains(e.target)) {
				this.$refs["items"].classList.remove("visible");
			}
		},
		_suggestItems() {
			if (!this.$data._data) return;
			
			this.$data.results = this.$data._data.filter(item => item.indexOf(this.$refs["input"].value) >= 0).slice(0, this.$data._maxResults);
			if (this.$data.results.length) {
				this.$refs["items"].classList.add("visible");
			} else {
				this.$refs["items"].classList.remove("visible");
			}
		},
		_itemClicked(e) {
			this.$refs["items"].classList.remove("visible");
			this.$data._value = e.target.innerText;
			
			this.$emit('input', this.$data._value);
			this.$emit('suggestionChosen', {
				sender: this,
				selectedItem: e.target.innerText
			});
		}
	}
};

var CommandBar = {
	name: "metro-command-bar",
	render(h) {
		return (
			<div class="command-bar">
				<div class="command-bar-inner">
					{this.$slots.content &&
					<div class="app-bar-content">
						{this.$slots.content}
					</div>
					}
					
					{this.$slots.buttons &&
					<div class="app-bar-buttons">
						{this.$slots.buttons}
					</div>
					}
					<div class="more" onClick={this.toggle}></div>
				</div>
			</div>
		)
	},
	methods: {
		open() {
			this.$el.classList.add("expanded")
		},
		close() {
			this.$el.classList.remove("expanded")
		},
		toggle() {
			this.$el.classList.toggle("expanded")
		}
	}
};

var AppBarButton = {
	name: "metro-app-bar-button",
	props: ["disabled", "icon", "title"],
	render(h) {
		return (
			<div class={{'app-bar-button': true, 'disabled': this.$props.disabled}}>
				<div class="app-bar-button-icon">
					<i class={`icon ${this.$props.icon}`}></i>
				</div>
				<p class="app-bar-button-content">{this.$slots.default}</p>
			</div>
		)
	}
};

var PersonPicture = {
	name: "metro-person-picture",
	props: ["profilePicture", "displayName", "initials"],
	data() {
		return {
			_initials: null
		}
	},
	render(h) {
		return (
			<div class="person-picture">
				{this.$data._initials &&
					<p class="initials" ref="initials">{this.$data._initials}</p>
				}
			</div>
		)
	},
	mounted() {
		if (this.$props.initials) {
			this.$data._initials = this.$props.initials.toUpperCase();
		} else if (this.$props.displayName) {
			this.$data._initials = this.$props.displayName.match(/(^\s?\w+\b|(\b\w+)[\.?!\s]*$)/g).map(name => name.slice(0,1)).join("");
		} else if (this.$props.profilePicture) {
			this.$el.style.backgroundImage = `url(${this.$props.profilePicture})`;
		}
	}
};

var AccentColorSelector = {
	name: "metro-accent-color-selector",
	render(h) {
		const accents = [];
		
		for (var i=0; i<48; i++) {
			accents.push(
				<div class="accent-color-item" onClick={this.selectAccent} data-accent={`win10-${i+1 < 10 ? "0" : ""}${i+1}`}></div>
			)
		}
		
		return (
			<div class="accent-color-selector">
				{accents}
			</div>
		)
	},
	methods: {
		selectAccent(e) {
			document.body.setAttribute("data-accent", e.target.getAttribute("data-accent"));
			this.$emit("accentSelect", e.target.getAttribute("data-accent"));
		}
	}
};

var Messages = {
	name: "metro-messages",
	data() {
		return {
			messages: [],
			messageText: ""
		}
	},
	render(h) {
		return (
			<div class="messages-container">
				<div class="messages-wrapper">
					{this.$data.messages.map(item => {
						return (
							<div class={{ "message": item.type != "system", [`message-${item.type}`]: true, "message-tail": item.hasTail, "message-first": item.isFirst }}>
								{(item.type == "sent" || item.type == "received") &&
								<div class="message-content">
									<div class="message-bubble">
										<p class="message-text">{item.text}</p>
										<div class="message-info">
											<p class="message-time">{this._formatTime(item.date)}</p>
											<p class="message-name">{item.displayName || item.author}</p>
										</div>
									</div>
								</div>
								}
								
								{item.type == "system" &&
								<span>{item.text}</span>
								}
							</div>
						)
					})}
				</div>
				
				<div class="messages-input">
					<button class="emoji-selector" disabled><i class="icon emoji2"></i></button>
					<input type="text" placeholder="Type a text message" value={this.$data.messageText} onInput={this.onInput} onKeydown={this.onKeyDown} />
					<button class="send-message" onClick={this.sendMessage} disabled={!this.$data.messageText.length}><i class="icon send"></i></button>
				</div>
			</div>
		)
	},
	methods: {
		_formatTime(date) {
			return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		},
		onInput(e) {
			this.$data.messageText = e.target.value;
		},
		onKeyDown(e) {
			if (e.keyCode == 13) {
				this.sendMessage();
			}
		},
		sendMessage() {
			if (!this.$data.messageText.length) return;
			
			this.$emit("messageSent", this.$data.messageText);
			this.$data.messageText = "";
		},
		addMessage(message) {
			// TODO: update previous messages (hasTail, isFirst)
			if (this.$data.messages.lastObject()) {
				const lastMessage = this.$data.messages.lastObject();
				
				if (lastMessage.type != "sent" && message.type == "sent") {
					message.hasTail = true;
					message.isFirst = true;
				} else if (lastMessage.type == "sent" && message.type == "sent") {
					lastMessage.hasTail = false;
					message.hasTail = true;
				}
				
				if (lastMessage.type != "received" && message.type == "received") {
					message.hasTail = true;
				} else if (lastMessage.type == "received" && message.type == "received") {
					if (message.author != lastMessage.author) {
						message.hasTail = true;
						message.isFirst = true;
					} else {
						message.hasTail = false;
					}
				}
			}
			
			this.$data.messages.push(message);
		},
		addSystemMessage(text) {
			this.$data.messages.push({ type: "system", text: text })
		}
	}
}

var NavigationView = {
	name: "metro-navigation-view",
	props: ["title", "history"],
	data() {
		return {
			_currentPage: null,
			_pages: {},
			_items: {},
			_history: []
		}
	},
	render(h) {
		return (
			<div class="navigation-view">
				<div class="navigation-view-menu" ref="menu">
					<div class="toggle-pane-button" ref="toggleButton" onClick={this.toggle}></div>
					
					{this.$props.history != false && 
						<div class="navigation-view-back-button" disabled={this.$data._history.length <= 1} onClick={this.goBack}></div>
					}

					<div class="navigation-view-items">
						{this.$slots["navigation-items"]}
					</div>
				</div>
				
				<div class="frame-header" ref="frameHeader">
					<div class="navigation-view-back-button" ref="backButton"></div>
					<div class="toggle-pane-button" onClick={this.toggle}></div>
					<p class="title" ref="frameTitle">{this.$props.title}</p>
				</div>
				
				<div class="frame" ref="frame">
					<div class="frame-content" ref="frameContent">
						{this.$slots["pages"]}
					</div>
				</div>
			</div>
		)
	},
	mounted() {
		this.$refs["frameContent"].querySelectorAll(".page").forEach((page, index) => {
			if (page.hasAttribute("data-page-id")) {
				this.$data._pages[page.getAttribute("data-page-id")] = new metroUI.Page(page, {
					parentPage: this,
					title: page.getAttribute("data-page-title")
				});
			}
		});
		
		this.$refs["frame"].addEventListener("scroll", this._frameScrolled);
		
		this.$refs["menu"].querySelectorAll(".navigation-view-item, .settings-button").forEach((item, index) => {
			if (item.hasAttribute("data-page")) {
				this.$data._items[item.getAttribute("data-page")] = item;

				item.addEventListener("click", () => {
					this.navigate(item.getAttribute("data-page"));
					
					if (window.innerWidth < 1008) {
						this.$refs["menu"].classList.remove("expanded");
					}
				});
			}
		});
	},
	destroyed() {
		this.$refs["frame"].removeEventListener("scroll", this._frameScrolled)
	},
	methods: {
		_frameScrolled() {
			if (this.$data._currentPage) {
				this.$data._currentPage._scrollTop = this.$refs["frame"].scrollTop;
			}
		},
		toggle() {
			const nav = this;
			if (window.innerWidth < 1008) {
				this.$refs["menu"].classList.toggle("expanded");
			} else {
				this.$refs["menu"].classList.toggle("retracted");
			}
		},
		navigate(pageName, _options) {
			var options = {
				url: null,
				addHistory: true
			}
			for (var option in _options) {
				options[option] = _options[option];
			}

			let page = this.$data._pages[pageName];
			if (page) {
				if (page.isVisible) return;
				
				page.show();
				this.$data._currentPage = page;
				this.setTitle(page.params.title);

				if (this.$data._items[pageName]) {
					if (this.$refs["menu"].querySelector(".selected")) {
						this.$refs["menu"].querySelector(".selected").classList.remove("selected");
					}
					this.$data._items[pageName].classList.add("selected");
				} else if (page.container.hasAttribute("data-nav-item")) {
					let navItem = page.container.getAttribute("data-nav-item");
					if (this.$data._items[navItem]) {
						if (this.$refs["menu"].querySelector(".selected")) {
							this.$refs["menu"].querySelector(".selected").classList.remove("selected");
						}
						this.$data._items[navItem].classList.add("selected");
					}
				}

				this.$refs["frame"].scrollTo(0, 0);

				// if (nav.params.internalHistory && options.addHistory) {
				if (this.$props.history != false) {
					this.$data._history.push(pageName);
				}
				// }
				// if (nav._history.length > 1) {
				// 	nav.backButton.classList.remove("disabled");
					
				// 	if (nav.frameHeader && nav.frameHeader.querySelector(".navigation-view-back-button")) {
				// 		nav.frameHeader.querySelector(".navigation-view-back-button").classList.remove("disabled");
				// 	}
				// }
			}/* else if (options.url) {
				_metroUIInstance.get(options.url, (responseText) => {
					var parsedPage = (new DOMParser()).parseFromString(responseText, "text/html").body.children[0];
					nav.frameContent.appendChild(parsedPage);
					nav._pages[pageName] = new metroUI.Page(parsedPage, {
						parentPage: nav.params.parentPage,
						parentView: nav,
						title: parsedPage.getAttribute("data-page-title")
					});
					_metroUIInstance.pluginHook("pageBeforeShow", nav._pages[pageName].pageData);

					nav._pages[pageName].show();
					nav._currentPage = nav._pages[pageName];
					nav.setTitle(parsedPage.getAttribute("data-page-title"));
					_metroUIInstance.pluginHook("pageShow", nav._pages[pageName].pageData);

					if (nav._items[pageName]) {
						if (nav.menu.querySelector(".selected")) {
							nav.menu.querySelector(".selected").classList.remove("selected");
						}
						nav._items[pageName].classList.add("selected");
					} else if (parsedPage.hasAttribute("data-nav-item")) {
						let navItem = parsedPage.getAttribute("data-nav-item");
						if (nav._items[navItem]) {
							if (nav.menu.querySelector(".selected")) {
								nav.menu.querySelector(".selected").classList.remove("selected");
							}
							nav._items[navItem].classList.add("selected");
						}
					}
					
					nav.frame.scrollTo(0, 0);

					if (nav.params.internalHistory && options.addHistory) {
						nav._history.push(pageName);
					}
					if (nav._history.length > 1) {
						nav.backButton.classList.remove("disabled");
						
						if (nav.frameHeader && nav.frameHeader.querySelector(".navigation-view-back-button")) {
							nav.frameHeader.querySelector(".navigation-view-back-button").classList.remove("disabled");
						}
					}
					
					_metroUIInstance.pluginHook("pageAfterShow", nav._pages[pageName].pageData);
				});
			}*/
		},
		goBack() {
			if (this.$data._history.length > 1) {
				this.$data._currentPage.hide();
	
				let lastPage = this.$data._pages[this.$data._history[this.$data._history.length - 2]];
				if (lastPage) {
					lastPage.show();
					this.$data._currentPage = lastPage;
					this.setTitle(lastPage.params.title);
	
					let pageName = lastPage.container.getAttribute("data-page-id");
					let itemName = lastPage.container.getAttribute("data-nav-item");
					if (this.$data._items[pageName]) {
						if (this.$refs["menu"].querySelector(".selected")) {
							this.$refs["menu"].querySelector(".selected").classList.remove("selected");
						}
						this.$data._items[pageName].classList.add("selected");
					} else if (this.$data._items[itemName]) {
						if (this.$refs["menu"].querySelector(".selected")) {
							this.$refs["menu"].querySelector(".selected").classList.remove("selected");
						}
						this.$data._items[itemName].classList.add("selected");
					}
					
					if (lastPage._scrollTop !== null) {
						this.$refs["frame"].scrollTo(0, lastPage._scrollTop);
					} else {
						this.$refs["frame"].scrollTo(0, 0);
					}
	
					this.$data._history.pop();
					// if (this.$data._history.length <= 1) {
					// 	nav.backButton.classList.add("disabled");
						
					// 	if (nav.frameHeader && nav.frameHeader.querySelector(".navigation-view-back-button")) {
					// 		nav.frameHeader.querySelector(".navigation-view-back-button").classList.add("disabled");
					// 	}
					// }
				}
			}
		},
		setTitle(title) {
			if (title && title.length) {
				this.$refs["frameTitle"].innerText = title;
				this.$refs["frameTitle"].parentElement.classList.remove("hidden");
			} else {
				this.$refs["frameTitle"].innerText = "";
				this.$refs["frameTitle"].parentElement.classList.add("hidden");
			}
		},
		querySelector(query) {
			return this.$el.querySelector(query);
		},
		querySelectorAll(query) {
			return this.$el.querySelectorAll(query);
		}
	}
}



export default {
	install(Vue, options) {
		Vue.mixin({
			components: {
				[Switch.name]: Switch,
				[Slider.name]: Slider,
				[ProgressBar.name]: ProgressBar,
				[List.name]: List,
				[AutoSuggestBox.name]: AutoSuggestBox,
				[CommandBar.name]: CommandBar,
				[AppBarButton.name]: AppBarButton,
				[PersonPicture.name]: PersonPicture,
				[AccentColorSelector.name]: AccentColorSelector,
				[Messages.name]: Messages,
				[NavigationView.name]: NavigationView
			},
			mounted() {
				if (this.$el.querySelector(".view")) {
					this.$el.querySelectorAll(".view").forEach((item, index) => {
						if (item.hasAttribute("data-view-id")) {
							metroUI.views[item.getAttribute("data-view-id")] = new metroUI.View(item, {
								isPrimaryView: index == 0
							})
						}
					})
				}
			}
		});
	}
}