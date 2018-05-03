// <------------ HELPFUL FUNCTIONS ------------->

const vanillaGet = url => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.addEventListener('load', e => {
			const data = JSON.parse(e.currentTarget.response);
			resolve(data)
		})
		xhr.addEventListener('error', err => {
			reject(err);
		})
		xhr.send();
	});
}
// <------------------ STATE ------------------->
const getColorPalette = () => {
	const state = {
		colors: ['ffffff', '000000'],
		rgbColors: ['(255,255,255)', '(0,0,0)'],
		rlValues: [1, 0],
		fonts: [],
		selectedFont: 'Lato',
		addColor: (hexValue) => {
			//ADD HEX
			state.colors.push(hexValue);
			//ADD RGB
			const bigint = parseInt(hexValue, 16);
		    const r = (bigint >> 16) & 255;
		    const g = (bigint >> 8) & 255;
		    const b = bigint & 255;
		    const rgbColor = "(" + r + "," + g + "," + b + ")";
		    state.rgbColors.push(rgbColor);
		    let rgb2 = {
		    	r2: '',
		    	g2: '',
		    	b2: '',
		    };
		    //ADD RL
		    const rlPromise = new Promise((resolve, reject) => {
		    	if (r <= 10) {
		    		rgb2.r2 = r / 3294;
			    }
			    else {
			    	rgb2.r2 = Math.pow(r / 269 + 0.0513, 2.4);
			    }
			    if (g <= 10) {
		    		rgb2.g2 = g / 3294;
			    }
			    else {
			    	rgb2.g2 = Math.pow(g / 269 + 0.0513, 2.4);
			    }
			    if (b <= 10) {
		    		rgb2.b2 = b / 3294;
			    }
			    else {
			    	rgb2.b2 = Math.pow(b / 269 + 0.0513, 2.4);
			    }
			    resolve(rgb2);
		    });
		    return rlPromise.then(rbg2 => {
			    const rl = (0.2126 * rgb2.r2) + (0.7152 * rgb2.g2) + (0.0722 * rgb2.b2);
		    	const roundedRL = Math.round(100*rl)/100
		    	state.rlValues.push(roundedRL);
		    });

		},
		editColor: () => {

		},
		removeColor: () => {

		},
		loadFonts: () => {
			const myAPIKey = 'AIzaSyDGqxeI3cU6L_wT9ZGsTTVFy-UTQv9g72A';
			const apiEndpoint = `https://www.googleapis.com/webfonts/v1/webfonts?key=${myAPIKey}`
	        const start = Date.now();
	        return vanillaGet(apiEndpoint)
				.then(data => {
					for (let i = 0; i < data.items.length; i++) {
						const fontName = data.items[i].family;
						state.fonts.push(fontName);
					}
				})
		},
	};
	return state;
}
// <-------------- INIT VARIABLES -------------->
const myColorPalette = getColorPalette();
const colorInput = document.querySelector('.js-color-input');
const colorButton = document.querySelector('.js-color-button');
const fontDropdown = document.querySelector('.js-font-dropdown');
const fontStylesheet = document.querySelector('.js-google-stylesheet');
const colorListContainer = document.querySelector('.js-color-list-container');
const colorExamplesContainer = document.querySelector('.js-color-examples-container');

// <------------------ RENDER ------------------>

const renderStylesheet = (state) => {
	const linkReadyFont = state.selectedFont.split(' ').join('+');
	const fontLinkURL = `https://fonts.googleapis.com/css?family=${linkReadyFont}`;
	fontStylesheet.setAttribute("href", fontLinkURL);
	colorExamplesContainer.style.fontFamily = state.selectedFont;
};

const renderColorList = (state) => {
	let colorListStr = '';
	let colorExamplesStr = '';
	colorExamplesContainer.classList.add('js-color-examples-container-active');
	for (let i = 0; i < state.colors.length; i++) {
		const currentColoNum = i;
		let textColorStr = '';
		for (let i=0; i < state.rlValues.length; i++) {
			rlNum1 = state.rlValues[currentColoNum] + 0.05;
			rlNum2 = state.rlValues[i] + 0.05;
			if (rlNum1 > rlNum2) {
				const rlCompare = rlNum1 / rlNum2;
				// console.log(rlCompare, 'bigNum1')
				if (rlCompare > 4.5) {
					textColorStr += `<p class="js-text-example" style="color:#${state.colors[i]};">This text in the color #${state.colors[i]} is AA accessible on a #${state.colors[currentColoNum]} background.</p>`
				}
			}
			else {
				const rlCompare = rlNum2 / rlNum1;
				// console.log(rlCompare, 'bigNum2')
				if (rlCompare > 4.5) {
					textColorStr += `<p class="js-text-example" style="color:#${state.colors[i]};">This text in the color #${state.colors[i]} is AA accessible on a #${state.colors[currentColoNum]} background.</p>`
				}
			}
		}
		colorListStr += `<div class="color-item-container"><div class="color-item" style="background-color:#${state.colors[i]};"></div><span class="color-text">#${state.colors[i]}</span></div>`;
		colorExamplesStr += `<div class="color-example" style="background-color:#${state.colors[i]};">${textColorStr}</div>`
	}
	colorListContainer.innerHTML = colorListStr;
	colorExamplesContainer.innerHTML = colorExamplesStr;
}

const renderDropdown = (state) => {
	state.loadFonts().then(data => {
		let str = '';
		for (let i = 0; i < state.fonts.length; i++) {
			str += `<option value="${state.fonts[i]}">${state.fonts[i]}</option>`;
		}
		fontDropdown.innerHTML = '<option selected>Choose a Google Font...</option>' + str;
	})

}


// <------------- EVENT LISTENERS -------------->

const onColorButtonClicked = (e) => {
	const colorInputValue = colorInput.value;
	const colorInputValueCharacters = colorInputValue.split('');
	const validCharacters = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	const isValidValues = [];

	for (let i = 0; i < colorInputValueCharacters.length; i++) {
		const characterValue = colorInputValueCharacters[i].toLowerCase();
		const characterIsValid = validCharacters.includes(characterValue);
		isValidValues.push(characterIsValid);
	}
	if (colorInputValue.length === 6 && isValidValues.indexOf(false) === -1) {
		
		myColorPalette.addColor(colorInputValue).then(data => {
		// console.log(myColorPalette.colors);
		// console.log(myColorPalette.rgbColors);
		// console.log(myColorPalette.rlValues);
		renderColorList(myColorPalette); });
		colorInput.value = '';
	}
	else {
		if(colorInputValue.length !== 6) {
			console.log('Must contain 6 characters.');
		}

		if(isValidValues.includes(false)) {
			console.log('Not a valid hex color.');
		}
	}
};

const fontDropdownSelected = (e) => {
	myColorPalette.selectedFont = e.target.value;
	console.log(myColorPalette.selectedFont);
	renderStylesheet(myColorPalette);
}


// <-------------- EVENT HANDLERS -------------->

renderDropdown(myColorPalette);
colorButton.addEventListener('click', onColorButtonClicked);
document.addEventListener('DOMContentLoaded',function() {
    fontDropdown.onchange=fontDropdownSelected;
},false);