# The Neighborhood Map Project - Best steaks in EL Paso TX!!!

**The Neighborhood Map Project** is a web page for checking -restaurants- This we page contain features like: map markers to identify popular locations or places for -STEAK- restaurants in El Paso, TX. that you’d like to visit, a search function to easily discover these locations, and a listview to support simple browsing of all locations. The web page also pull information from the FourSquare API to get the address, phone number and web page.

____________________________________________

## Instructions

To run the application, you need to have a devide with the following requirements.

### Minimum Hardware Requirements

1. Browser with HTML5 support.
	
Supported Browsers:

- Google Chrome version 37 or later on Windows 7 or later, Mac OS X 10.9 or later (Mavericks), Chrome OS, or Linux*
- Internet Explorer 11 or later on Windows 8.1 or later
- Microsoft Edge on Windows 10
- Mozilla Firefox version 47 or later on Windows Vista or later, Mac OS X 10.7 or later, or Linux*
- Supported on stable, official release builds from Mozilla. Non-Mozilla builds are not supported.
- Opera version 33 or later on Windows Vista Service Pack 2 or later and Mac OS X 10.9 or later
- Safari on Mac OS X 10.10 or later (Yosemite) (Supported on all 2012 or later models and select 2011 models)
	
## How to view the page

You need to run the web page from a server, execute the following command from the terminal or the command line.


* `python -m SimpleHTTPServer`

Access to the following address `http://localhost:8080/index.html`.

## How to use the Application

The Application shows all the places by default, if you want to search an specific place, click the top left icon of the screen, a pop up window will appear with a list containing all the places. After typing the place name on the textbox, the list will be filtering automatically, without the need to do a call to the server.

You must select an item from the list or from the map to animate the icon. If you select another icon from the map, the previous icon will stop the animation and the icon selected will start the animation.

Selecting an icon from the map or selecting an item from the list will animate the icon, open a small window with the rating review of the place and at the bottom of the map, you will get the restaurant name, phone number and web page information. This information is provided by de FourSquare API.
