import crypto from "crypto";

/**
 * Helper methods to get the first and last objects in an array
 */
Array.prototype.firstObject = function() {
	return this[0];
}
Array.prototype.lastObject = function() {
	return this[this.length - 1];
}



/**
 * Returns the index of a node in a parent node
 * @param {HTMLElement} node The node to get the index for
 */
var findInRow = (node) => {
	var i = 0;
	while (node = node.previousSibling) {
		if (node.nodeType === 1) { ++i; }
	}

	return i;
}

/**
 * Gets the absolute position of an element on the current page
 * @param {HTMLElement} element The node to get the absolute position for
 */
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

/**
 * 
 */
HTMLElement.prototype.parentNodeOfClass = function(className) {
	var node = this.parentNode;
	while (node) {
		// console.log(node);
		if (node.classList.contains(className)) {
			return node;
		}
		node = node.parentNode
	}
	
	return null;
}

/**
 * Enum containing possible ContentDialogResult values
 */
let ContentDialogResult = {
	None: 0,
	Primary: 1,
	Secondary: 2
};



/**
 * Our global metroUI object
 * We're also adding it to the window object to access it from anywhere
 */
var metroUI = window.metroUI = {};

// Store all views in here
metroUI.views = {};



/**
 * The 'View' class contains references to Pages, allows
 * navigating between them and its visibility can be toggled
 */
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

	/**
	 * Navigate to a page this view references
	 * @param {String} pageName The name of the page you want to navigate to. Must be referenced by this view
	 * @param {Object} _options An object containing the 'addHistory' flag to specify the use of history
	 */
	navigate(pageName, _options) {
		const view = this;

		var options = {
			//url: null,
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
		}
	}

	/**
	 * Show the last page stored in the hitory array
	 */
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

	/**
	 * Show this view while hiding any other view
	 */
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

	/**
	 * Hide this view
	 */
	hide() {
		this.container.classList.remove("view-active");
	}

	/**
	 * INTERNAL: Wrapper for querySelector and querySelectorAll inside the view container
	 * @param {String} query The CSS-like query to select
	 */
	querySelector(query) {
		return this.container.querySelector(query);
	}
	querySelectorAll(query) {
		return this.container.querySelectorAll(query);
	}
}

/**
 * The 'Page' class references DOM pages (.page) and
 * its visibility can be toggled
 */
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
	
	/**
	 * Show this page while hiding any other page in
	 * a) the parent page (eg. NavigatioView)
	 * b) the parent view
	 */
	show() {
		let page = this;

		if (page.params.parentPage) {
			page.params.parentPage.querySelectorAll(".page").forEach((item) => {
				if (item == page.container) {
					item.classList.add("page-active");
				} else if (item.parentNodeOfClass("page") == page.container.parentNodeOfClass("page")) {
					item.classList.remove("page-active");
				}
			});
		} else if (page.params.parentView) {
			page.params.parentView.querySelectorAll(".pages > .page").forEach((item) => {
				if (item == page.container) {
					item.classList.add("page-active");
				} else if (item.parentNodeOfClass("page") == page.container.parentNodeOfClass("page")) {
					item.classList.remove("page-active");
				}
			});
		}
	}

	/**
	 * Hide this page
	 */
	hide() {
		this.container.classList.remove("page-active");
	}

	/**
	 * Returns true if this page is currently visible, otherwise false
	 */
	get isVisible() {
		return this.container.classList.contains("page-active");
	}
	
	/**
	 * Get this page's data, mainly used for navigation
	 */
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

	/**
	 * INTERNAL: Wrapper for querySelector and querySelectorAll inside the view container
	 * @param {String} query The CSS-like query to select
	 */
	querySelector(query) {
		return this.container.querySelector(query);
	}
	querySelectorAll(query) {
		return this.container.querySelectorAll(query);
	}
}

/**
 * The 'ContentDialog' class can be used as a replacement for
 * alert() and confirm(). prompt() is not supported
 * 
 * @param {String} _title The title of the of the dialog
 * @param {String} _content The message of the dialog
 * @param {Array} buttons An array containing the buttons. Buttons have a title and a 'primary' flag
 */
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
	
	/**
	 * Shows a dialog asynchroneously and returns a promise,
	 * which later returns a ContentDialogResult value
	 * @returns {Promise} A promise which will return the value of the clicked button
	 */
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
	
	/**
	 * Hides the dialog. Mainly used for the buttons, 
	 * but can also be used externally
	 */
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


/**
 * Select the current accent color
 * @fires accentSelect Fired when the user selects an accent color. Contains the current accent color name
 */
var AccentColorSelector = {
	name: "metro-accent-color-selector",
	render(h) {
		const accents = [];
		
		for (var i=0; i<48; i++) {
			accents.push(
				<div class="accent-color-item" onClick={this._selectAccent} data-accent={`win10-${i+1 < 10 ? "0" : ""}${i+1}`}></div>
			)
		}
		
		return (
			<div class="accent-color-selector">
				{accents}
			</div>
		)
	},
	methods: {
		_selectAccent(e) {
			document.body.setAttribute("data-accent", e.target.getAttribute("data-accent"));
			this.$emit("accentSelect", e.target.getAttribute("data-accent"));
		}
	}
};

/**
 * A button that's styled for use in a CommandBar.
 * @param {Boolean} disabled Specifies if this button is disabled
 * @param {String} icon Sets the icon next to the title
 * @param {String} title Sets the title of the button
 */
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

/**
 * A control to provide suggestions as a user is typing.
 * @param {Any} value Represents the bound v-model
 * @param {String} placeholder The placeholder text to show inside the input field
 * @param {Array} data The initial data set
 * @param {Number} maxResults Specifies the maximum number of results to show (default 4)
 * @fires input Fired when the user enters text or selects a suggested item
 * @fires textChanged Fired only if the user enters text
 * @fires suggestionChosen Fired if the user selected a suggested item
 */
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
				<input type="text" value={this.$data._value} placeholder={this.$props.placeholder} ref="input" onInput={this._onInput}></input>
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
		_onInput(e) {
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
		},
		
		/**
		 * Sets a new data source
		 * @param {Array} source The new data source to use
		 */
		setDataSource(source) {
			this.$data._data = source;
		}
	}
};

/**
 * A control that a user can select or clear.
 * @param {Any} value Represents the bound v-model
 * @fires input Fired if the checkbox state changed to update the model
 */
var Checkbox = {
	name: "metro-checkbox",
	props: ["value"],
	data() {
		return {
			id: crypto.randomBytes(20).toString("hex"),
			_checked: this.$props.value,
		}
	},
	render(h) {
		return (
			<div class="checkbox">
				<input type="checkbox" id={this.$data.id} onChange={this._onChange} />
				<label for={this.$data.id}>
					<p class="item-label">{this.$slots.default}</p>
				</label>
			</div>
		)
	},
	methods: {
		_onChange(e) {
			this.$data._checked = e.target.checked;
			this.$emit('input', this.$data._checked);
		}
	}
};

/**
 * A drop-down list of items a user can select from.
 * @param {Any} value Represents the bound v-model
 * @fires input Fired if the user selected a list item to update the model
 */
var ComboBox = {
	name: "metro-combo-box",
	props: ["value"],
	data() {
		return {
			_value: this.$props.value
		}
	},
	render(h) {
		return (
			<div class="list" onClick={this._onClick}>
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
		_onClick(e) {
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

			e.stopPropagation();
		}
	}
};

/**
 * A toolbar for displaying application-specific commands that handles layout and resizing of its contents.
 */
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
		/**
		 * Open this CommandBar
		 */
		open() {
			this.$el.classList.add("expanded")
		},
		/**
		 * Close this CommandBar
		 */
		close() {
			this.$el.classList.remove("expanded")
		},
		/**
		 * Toggle this CommandBar's open state
		 */
		toggle() {
			this.$el.classList.toggle("expanded")
		}
	}
};

/**
 * Common vertical layout for top-level areas of your app via a collapsible navigation menu
 * @param {String} title Sets the title of the NavigationView
 * @param {String} menuTitle Sets the title that is displayed next to the Menu Button
 * @param {String} acrylic Sets the acrylic background variant (60%, 70%, 80%)
 */
var ListView = {
	name: "metro-list-view",
	props: ["title", "menuTitle", "acrylic"],
	data() {
		return {
			_acrylic: this.$props.acrylic || "acrylic-60",
			_currentPage: null,
			_pages: {},
			_items: {},
		}
	},
	render(h) {
		return (
			<div class="list-view">
				<div class={{[`list-view-menu acrylic ${this.$data._acrylic}`]: true}} ref="menu">
					<div class="list-view-header">
						<p class="list-view-title">{this.$props.menuTitle}</p>
						
						{this.$slots["actions"]}
						{/* <div class="list-view-action">
							<i class="icon more" />
						</div> */}
					</div>

					<div class="list-view-items">
						{this.$slots["list-items"]}
					</div>
					
					<div class="list-view-bottom-items">
						{this.$slots["bottom-items"]}
					</div>
				</div>
				
				{this.$slots["pages"] &&
				<div class="frame-header" ref="frameHeader">
					<p class="title" ref="frameTitle">{this.$props.title}</p>
				</div>
				}
				
				{this.$slots["pages"] &&
				<div class="frame" ref="frame">
					<div class="frame-content" ref="frameContent">
						{this.$slots["pages"]}
					</div>
				</div>
				}
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
		
		this.$refs["menu"].querySelectorAll(".list-view-item").forEach((item, index) => {
			if (item.hasAttribute("data-page")) {
				this.$data._items[item.getAttribute("data-page")] = item;

				item.addEventListener("click", () => {
					this.navigate(item.getAttribute("data-page"));
				});
			}
		});
	},
	methods: {
		_frameScrolled() {
			if (this.$data._currentPage) {
				this.$data._currentPage._scrollTop = this.$refs["frame"].scrollTop;
			}
		},

		/**
		 * Navigate to a page this view references
		 * @param {String} pageName The name of the page you want to navigate to. Must be referenced by this NavigationView
		 * @param {*} _options -- NOT IN USE
		 */
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
			}
		},
		/**
		 * Set the title of this NavigationView
		 * @param {String} title The title to set. Can be empty
		 */
		setTitle(title) {
			if (title && title.length) {
				this.$refs["frameTitle"].innerText = title;
				this.$refs["frameTitle"].parentElement.classList.remove("hidden");
			} else {
				this.$refs["frameTitle"].innerText = "";
				this.$refs["frameTitle"].parentElement.classList.add("hidden");
			}
		},
		
		/**
		 * INTERNAL: Wrapper for querySelector and querySelectorAll inside the view container
		 * @param {String} query The CSS-like query to select
		 */
		querySelector(query) {
			return this.$el.querySelector(query);
		},
		querySelectorAll(query) {
			return this.$el.querySelectorAll(query);
		}
	}
};

/**
 * Represents an action located in a ListView header
 * @param {String} icon The icon to show next to the title
 */
var ListViewAction = {
	name: "metro-list-view-action",
	props: ["icon"],
	render(h) {
		return (
			<div class="list-view-action">
				<i class={`icon ${this.$props.icon}`}></i>
			</div>
		)
	}
};

/**
 * Represents a item for use in a ListView
 * @param {String} page The page to navigate to. Must be referenced by the parent ListView
 * @param {String} icon The icon to show next to the title
 * @param {String} title The title of this item
 */
var ListViewMenuItem = {
	name: "metro-list-view-menu-item",
	props: ["page", "icon", "title"],
	render(h) {
		return (
			<div class="list-view-item" data-page={this.$props.page}>
				<div class="list-view-item-inner">
					{this.$props.icon &&
					<div class="list-view-item-icon"><i class={`icon ${this.$props.icon}`}></i></div>
					}
					<p class="list-view-item-content">{this.$props.title}</p>
				</div>
			</div>
		)
	}
};

/**
 * Represents a separator in a ListView
 * @param {String} title The title of this item
 */
var ListViewMenuSeparator = {
	name: "metro-list-view-menu-separator",
	props: ["title"],
	render(h) {
		return (
			<div class="list-view-item-separator">
				<p>{this.$props.title}</p>
			</div>
		)
	}
};

/**
 * Displays a conversation between two or more people
 * @fires messageSent Fired if the current user sends a message. Contains the sent message's text
 */
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
					<input type="text" placeholder="Type a text message" value={this.$data.messageText} onInput={this._onInput} onKeydown={this._onKeyDown} />
					<button class="send-message" onClick={this._sendMessage} disabled={!this.$data.messageText.length}><i class="icon send"></i></button>
				</div>
			</div>
		)
	},
	methods: {
		_formatTime(date) {
			return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		},
		_onInput(e) {
			this.$data.messageText = e.target.value;
		},
		_onKeyDown(e) {
			if (e.keyCode == 13) {
				this._sendMessage();
			}
		},
		_sendMessage() {
			if (!this.$data.messageText.length) return;
			
			this.$emit("messageSent", this.$data.messageText);
			this.$data.messageText = "";
		},
		
		/**
		 * Adds a new message to the conversation.
		 * Previous messages may be updated to respect the kind of message added
		 * @param {*} message The message to add
		 */
		addMessage(message) {
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
			} else {
				message.hasTail = true;
				message.isFirst = true;
			}
			
			this.$data.messages.push(message);
			
			setTimeout(() => {
				this.$el.parentElement.scrollTo(0, this.$el.scrollHeight);
			});
		},
		/**
		 * Adds a system message to the conversation
		 * @param {*} text The text to add to the conversation
		 */
		addSystemMessage(text) {
			this.$data.messages.push({ type: "system", text: text });
			
			setTimeout(() => {
				this.$el.parentElement.scrollTo(0, this.$el.scrollHeight);
			});
		}
	}
};

/**
 * Common vertical layout for top-level areas of your app via a collapsible navigation menu
 * @param {String} title Sets the title of the NavigationView
 * @param {Boolean} history If false, disable the use of history in this NavigationView
 * @param {String} menuTitle Sets the title that is displayed next to the Menu Button
 * @param {String} acrylic Sets the acrylic background variant (60%, 70%, 80%)
 * @param {Boolean} startExpanded Expands the navigation view on load (< 768 px)
 * @param {Boolean} startRetracted Retracts the navigation view on load (>= 768 px)
 */
var NavigationView = {
	name: "metro-navigation-view",
	props: ["title", "history", "menuTitle", "acrylic", "startExpanded", "startRetracted"],
	data() {
		return {
			_acrylic: this.$props.acrylic || "acrylic-60",
			_menuTitle: this.$props.menuTitle,
			_startExpanded: this.$props.startExpanded || false,
			_startRetracted: this.$props.startRetracted || false,
			_currentPage: null,
			_pages: {},
			_items: {},
			_history: []
		}
	},
	render(h) {
		return (
			<div class="navigation-view">
				<div class={{[`navigation-view-menu acrylic ${this.$data._acrylic}`]: true, "expanded": this.$data._startExpanded, "retracted": this.$data._startRetracted}} ref="menu">
					<div class={{"toggle-pane-button": true, "title": this.$data._menuTitle != null}} ref="toggleButton" onClick={this.toggle}>
						<p>{this.$data._menuTitle}</p>
					</div>
					
					{this.$props.history != false && 
					<div class="navigation-view-back-button" disabled={this.$data._history.length <= 1} onClick={this.goBack}></div>
					}

					<div class="navigation-view-items">
						{this.$slots["navigation-items"]}
					</div>
					
					<div class="navigation-view-bottom-items">
						{this.$slots["bottom-items"]}
					</div>
				</div>
				
				<div class="frame-header" ref="frameHeader">
					{this.$props.history != false && 
					<div class="navigation-view-back-button" ref="backButton"></div>
					}
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
	methods: {
		_frameScrolled() {
			if (this.$data._currentPage) {
				this.$data._currentPage._scrollTop = this.$refs["frame"].scrollTop;
			}
		},
		
		/**
		 * Toggles this NavigationView's open state
		 */
		toggle() {
			const nav = this;
			if (window.innerWidth < 1008) {
				this.$refs["menu"].classList.toggle("expanded");
			} else {
				this.$refs["menu"].classList.toggle("retracted");
			}
		},
		/**
		 * Navigate to a page this view references
		 * @param {String} pageName The name of the page you want to navigate to. Must be referenced by this NavigationView
		 * @param {*} _options -- NOT IN USE
		 */
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

				if (this.$props.history != false) {
					this.$data._history.push(pageName);
				}
			}
		},
		/**
		 * Show the last page stored in the hitory array
		 */
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
	
					if (this.$props.history != false) {
						this.$data._history.pop();
					}
				}
			}
		},
		/**
		 * Set the title of this NavigationView
		 * @param {String} title The title to set. Can be empty
		 */
		setTitle(title) {
			if (title && title.length) {
				this.$refs["frameTitle"].innerText = title;
				this.$refs["frameTitle"].parentElement.classList.remove("hidden");
			} else {
				this.$refs["frameTitle"].innerText = "";
				this.$refs["frameTitle"].parentElement.classList.add("hidden");
			}
		},
		
		/**
		 * INTERNAL: Wrapper for querySelector and querySelectorAll inside the view container
		 * @param {String} query The CSS-like query to select
		 */
		querySelector(query) {
			return this.$el.querySelector(query);
		},
		querySelectorAll(query) {
			return this.$el.querySelectorAll(query);
		}
	}
};

/**
 * Represents a item for use in a NavigationView
 * @param {String} page The page to navigate to. Must be referenced by the parent NavigationView
 * @param {String} icon The icon to show next to the title
 * @param {String} title The title of this item
 */
var NavigationViewMenuItem = {
	name: "metro-navigation-view-menu-item",
	props: ["page", "icon", "title"],
	render(h) {
		return (
			<div class="navigation-view-item" data-page={this.$props.page}>
				<div class="navigation-view-item-inner">
					<div class="navigation-view-item-icon"><i class={`icon ${this.$props.icon}`}></i></div>
					<p class="navigation-view-item-content">{this.$props.title}</p>
				</div>
			</div>
		)
	}
};

/**
 * Represents a separator in a NavigationView
 * @param {String} title The title of this item
 */
var NavigationViewMenuSeparator = {
	name: "metro-navigation-view-menu-separator",
	props: ["title"],
	render(h) {
		return (
			<div class="navigation-view-item-separator">
				<p>{this.$props.title}</p>
			</div>
		)
	}
};

/**
 * Displays the picture of a person/contact.
 * Use either of the attributes to display a person/contact
 * @param {String} profilePicture A URL to an image (eg. profile image)
 * @param {String} displayName Full name of a person/contact which gets broken down to initials
 * @param {String} initials The initials of a person/contact to show
 */
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
			if (this.$props.displayName.match(/(^\s?\w+\b|(\b\w+)[\.?!\s]*$)/g)) {
			this.$data._initials = this.$props.displayName.match(/(^\s?\w+\b|(\b\w+)[\.?!\s]*$)/g).map(name => name.slice(0,1)).join("");
			} else {
				this.$data._initials = this.$props.displayName.slice(0,1);
			}
		} else if (this.$props.profilePicture) {
			this.$el.style.backgroundImage = `url(${this.$props.profilePicture})`;
		}
	}
};

/**
 * Shows the apps progress on a task, or that the app is performing ongoing work that doesn't block user interaction.
 * @param {Any} value Represents the bound v-model
 * @param {Number} min The minimum value of this ProgressBar
 * @param {Number} max The maximum value of this ProgressBar
 */
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

/**
 * A control that lets the user select from a range of values by moving a Thumb control along a track
 * @param {Any} value Represents the bound v-model
 * @param {Number} min The minimum value of this Slider
 * @param {Number} max The maximum value of this Slider
 * @param {Number} step The step size of this Slider
 * @param {String} title The text of the control header above the slider. Can be empty
 * @fires input Fired if the slider value changed to update the model
 */
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
				<input type="range" min={this.$data._min} max={this.$data._max} value={this.$data._value} step={this.$data._step} ref="input" onInput={this._onInput} onMousedown={this._onMouseDown} onMouseup={this._onMouseUp}></input>
				<div class="value" ref="value"></div>
			</div>
		)
	},
	mounted() {
		this.$refs["fill"].style.width = `${this._getValue() * 100}%`;
	},
	methods: {
		_onInput(e) {
			this.$refs["fill"].style.width = `${this._getValue() * 100}%`;
			
			this.$refs["value"].style.left = `${this._getValue() * 100}%`;
			this.$refs["value"].style.transform = `translate3d(calc((-50% + 4px) - ${this._getValue() * 8}px), 0, 0)`;
			this.$refs["value"].innerHTML = parseInt(this.$refs["input"].value);
			
			this.$data._value = this.$refs["input"].value;
			this.$emit('input', this.$data._value);
		},
		_onMouseDown() {
			this.$refs["value"].classList.add("visible");
			this.$refs["value"].style.left = `${this._getValue() * 100}%`;
			this.$refs["value"].style.transform = `translate3d(calc((-50% + 4px) - ${this._getValue() * 8}px), 0, 0)`;
			this.$refs["value"].innerHTML = parseInt(this.$refs["input"].value);
		},
		_onMouseUp() {
			this.$refs["value"].classList.remove("visible");
		},
		_getValue() {
			let input = this.$refs["input"];
			return (input.value - input.min) / (input.max - input.min);
		}
	}
};

/**
 * A switch that can be toggled between 2 states.
 * @param {Any} value Represents the bound v-model
 * @param {String} onContent The text to show next to the ToggleSwitch in it 'on' state (default: "On")
 * @param {String} offContent The text to show next to the ToggleSwitch in it 'off' state (default: "Off")
 * @fires input Fired if the ToggleSwitch state changed to update the model
 */
var ToggleSwitch = {
	name: "metro-toggle-switch",
	props: ["value", "onContent", "offContent"],
	data() {
		return {
			id: crypto.randomBytes(20).toString("hex"),
			_checked: this.$props.value,
			_onContent: this.$props.onContent ? this.$props.onContent : "On",
			_offContent: this.$props.offContent ? this.$props.offContent : "Off",
		}
	},
	render(h) {
		return (
			<div class="toggle-switch">
				<input type="checkbox" checked={this.$data._checked} id={this.$data.id} onChange={this._onChange} ref="input"></input>
				<label for={this.$data.id}>
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
		_onChange(e) {
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



export default {
	install(Vue, options) {
		Vue.mixin({
			components: {
				[AccentColorSelector.name]: AccentColorSelector,
				[AppBarButton.name]: AppBarButton,
				[AutoSuggestBox.name]: AutoSuggestBox,
				[Checkbox.name]: Checkbox,
				[ComboBox.name]: ComboBox,
				[CommandBar.name]: CommandBar,
				[ListView.name]: ListView,
				[ListViewAction.name]: ListViewAction,
				[ListViewMenuItem.name]: ListViewMenuItem,
				[ListViewMenuSeparator.name]: ListViewMenuSeparator,
				[Messages.name]: Messages,
				[NavigationView.name]: NavigationView,
				[NavigationViewMenuItem.name]: NavigationViewMenuItem,
				[NavigationViewMenuSeparator.name]: NavigationViewMenuSeparator,
				[PersonPicture.name]: PersonPicture,
				[ProgressBar.name]: ProgressBar,
				[Slider.name]: Slider,
				[ToggleSwitch.name]: ToggleSwitch
			},
			mounted() {
				if (this.$el.querySelector && this.$el.querySelector(".view")) {
					this.$el.querySelectorAll(".view").forEach((item, index) => {
						if (item.hasAttribute("data-view-id")) {
							metroUI.views[item.getAttribute("data-view-id")] = new metroUI.View(item, {
								isPrimaryView: index == 0
							});
						}
					});
				}
			}
		});
	}
}