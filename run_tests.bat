@echo off

echo.
echo ---------------------------------------------
echo Run unit tests
mongo --quiet --nodb test_toQueryKeys.js
IF NOT ERRORLEVEL 0 (
	goto error:	
) 
echo ---------------------------------------------


rem 
rem echo.
rem echo ---------------------------------------------
rem echo Run example, to smoke test it in node.
rem node EcmaUnitTests_ExampleNode.js
rem IF NOT ERRORLEVEL 0 (
rem 	goto error:	
rem ) 
rem echo ---------------------------------------------


echo.
echo --------
echo  SUCESS 
echo --------
goto eof:

:error
echo.
echo ************
echo ** FAILED **
echo ************



:eof
