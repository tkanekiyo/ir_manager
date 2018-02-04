var firebase = require("firebase");
var wol = require("wol");

// PC MAC address
var pc_mac = "94:de:80:c5:53:09";

// firebase config
var config = {
    apikey: "AIzaSyDGovAymoeXQfdIAnNFw8fnDXp2MTb7OHk",
    authDomain: "home-project-931c1.firebaseapp.com",
    databaseURL: "https://home-project-931c1.firebaseio.com",
    projectId: "home-project-931c1",
    storageBucket: "home-project-931c1.appspot.com",
    messagingSenderId: "517706936392"
};
firebase.initializeApp(config);

//get value from json
const getJsonData = (value, json) => {
    for (var word in json)
	if(value == word) return json[word]
    return json["default"]
}

//path for IR data
const data_path = "/usr/local/googlehome/";

//database updated
const db_path = "/googlehome";
const key = "word";
const db = firebase.database();
db.ref(db_path).on("value", function(changedSnapshot) {
    //get value
    const value = changedSnapshot.child(key).val();
    if(value) {
	console.log(value);
	//generate command
	const command = getJsonData(value.split(" ")[0], {
	    //light
	    "light": () => {
		const command = "/usr/local/bin/usbir_send ";
		const option = getJsonData(value.split(" ")[1], {
		    "on": "on",
		    "small": "small",
		    "off": "off",
		    "default": false
		});
		return option ? command + data_path + "light_" + option + ".txt": option;
	    },
	    //heater
	    "heater": () => {
		const command = "/usr/local/bin/usbir_send ";
		const option = getJsonData(value.split(" ")[1], {
		    "on": "on",
		    "off": "off",
		    "default": false
		});
		return option ? command + data_path + "heater_" + option + ".txt": option;
	    },
	    //PC
	    "pc": () => {
		const command = "echo Wake on RABIT";
		const wake = () => wol.wake(pc_mac);
		wol.wake(pc_mac);
		const option = getJsonData(value.split(" ")[1], {
		    "on": wake,
		    "default": false
		});
		return null;
	    },
	    //template
	    "xxx": () => {
		return getJsonData(value.split(" ")[1], {
		    "xxx": "xxx",
		    "default": false
		});
	    },

	    //default
	    "default": ()=> false,
	})();
	console.log(command);

	//run command
	if(command) {
	    const exec = require('child_process').exec;
	    exec(command);
	    //clear firebase database
	    db.ref(db_path).set({[key]: ""});
	}
    }
});

