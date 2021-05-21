@ echo off
for /f "tokens=1,2* delims==" %%i in (.env) do if "%%i"=="ENV_ID" set ENV_ID=%%j
echo ENV_ID = %ENV_ID%
npm run build && tcb hosting deploy .\docs\.vuepress\dist -e %ENV_ID%