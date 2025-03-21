cd /d "C:\laragon\www\patrick\game-calc-frontend"
echo Pulling latest code from Git...
for /f "tokens=*" %%i in ('git pull') do set "git_output=%%i"
echo !git_output!

echo !git_output! | findstr /i /c:"Already up to date." >nul
if %errorlevel% equ 0 (
    echo Repository is already up to date. Skipping to Docker build...
    goto docker_build_frontend
)

echo Git pull completed!

:docker_build_frontend
echo Building Docker image for frontend...
docker build -t 192.168.6.64:5500/game-calculator-frontend:latest .
if %errorlevel% neq 0 (
    echo Docker build failed. Exiting...
    exit /b 1
)
echo Docker build completed!

echo Pushing Docker image to registry...
docker push 192.168.6.64:5500/game-calculator-frontend:latest
if %errorlevel% neq 0 (
    echo Docker push failed. Exiting...
    exit /b 1
)
echo Docker push completed!

echo Deleting existing ConfigMap (if it exists)...
kubectl delete configmap game-calculator-frontend-env --ignore-not-found
echo Existing ConfigMap deleted (if it existed).

echo Creating Kubernetes ConfigMap for frontend...
kubectl create configmap game-calculator-frontend-env --from-env-file=./.env
if %errorlevel% neq 0 (
    echo Failed to create ConfigMap. Exiting...
    exit /b 1
)
echo ConfigMap created!

echo Applying Kubernetes deployment for frontend...
kubectl apply -f frontend-deployment.yaml
if %errorlevel% neq 0 (
    echo Kubernetes deployment failed. Exiting...
    exit /b 1
)
echo Kubernetes deployment applied!
kubectl rollout restart deployment game-calculator-frontend
if %errorlevel% neq 0 (
    echo Rollout restart failed. Exiting...
    exit /b 1
)
echo Verifying frontend deployment...
kubectl get pods
kubectl get svc

echo ============================================
echo Frontend Deployment completed successfully!
echo ============================================