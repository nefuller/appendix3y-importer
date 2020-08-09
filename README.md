### ASX Appendix3Y Importer

A React/Typescript and Hapi application that uses the Tesseract OCR Library to import data from Australian Stock Exchange Appendix-3Y Change of Directors' Interest forms.

![alt text](https://github.com/nefuller/appendix3y-importer/blob/master/src/server/test/test_data/appendix3y-original.png?raw=true)
![alt text](https://github.com/nefuller/appendix3y-importer/blob/master/screenshot.png?raw=true)

## Setup

# Install Tesseract OCR Library

  - Install the Tesseract OCR Library from https://github.com/UB-Mannheim/tesseract/wiki.
      Note: This app was developed against 'tesseract-ocr-w64-setup-v5.0.0-alpha.20200328.exe' but should work against newer versions as long as the command line interface remains stable.
  - Add Tesseract's install location (usually C:\Program Files\Tesseract-OCR) to PATH environment variable.
  - Verify that Tesseract is accessible by running the command 'tesseract' on the command line.
  
# Install Application

  - Clone this repository and open a terminal in the target directory.
  - Run the command 'npm i' to install node modules.
  - Run the command 'npm start' to launch the server and open the client in a browser window.

# How to Use

  - There are test documents in the folder './src/server/tests/test_data'. Drag and drop files from this folder into the application's file drop and they will be imported and displayed in a table. Once you have imported some files you can use the Export CSV button to download a .csv file.

  - There is also a file 'appendix-3y-template' in the test_data folder. This file is an empty form that can be populated with test data (e.g. in Paint.Net or similar) to produce new test files.