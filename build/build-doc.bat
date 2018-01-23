@set REPLACE_FILE=.\CesiumMeshVisualizer.js
@set DOC_PATH=..\Document
jsdoc %REPLACE_FILE% -d %DOC_PATH%
@pause