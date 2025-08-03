
# Electric Avenue

## Content
- [General](#general)
- [Installation](#installation)
- [Deployment](#deployment)

## General
In project uses `yarn` package manager.

I have configured pre-hooks for git push (test) and git commit (lint --fixed). To execute the action without a hook, add the `-n/--no-verify` flag. For example `git commit -m "" -n`

## Installation
### Required to install
- NodeJS (20.x)

*install npm packages*

```bash  
yarn install  
```  
```bash  
cd client && yarn install  
yarn run dev  
```  
```bash  
cd server && yarn install  
yarn run start:dev  
```  
```bash  
cd mobile && yarn install  
npx expo start  
```  

* To run the project you need an .env file in root folder/client folder/server folder/mobile folder
* I'm attached .env.example files

## Deployment
### 🚀 CI/CD (GitHub Actions)

This project uses a **CI/CD pipeline** powered by **GitHub Actions** that automatically:

1. **Installs dependencies** for both backend (`server`) and frontend (`client`)
2. **Runs tests** (if any)
3. **Builds Docker images** for both services
4. **Pushes the images** to Docker Hub
5. **Deploys the application** to a remote server via SSH

### 🔄 How It Works

1. On every **push** to the `main` branch:
    - Two independent jobs are triggered: `server` and `client`.
    - Each job:
        - Sets up Node.js (version 20)
        - Installs dependencies using `yarn`
        - Runs tests with `yarn test --passWithNoTests`
        - Builds a multi-architecture Docker image (`linux/amd64`, `linux/arm64`). **[Important](#about-arm-architecture)**
        - Pushes the image to Docker Hub
2. After both jobs complete successfully, the `deploy` job runs:
    - Connects to your server over SSH
    - Pulls the latest Docker images
    - Recreates the containers using `docker-compose`

### 🔐 Required GitHub Secrets

To make this pipeline work, the following secrets must be added to your GitHub repository:

| Secret Name         | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `DOCKER_USERNAME`   | Your Docker Hub username                                                    |
| `DOCKER_PASSWORD`   | Your Docker Hub password or [Access Token](https://hub.docker.com/settings/security) |
| `SERVER_HOST`       | IP address or domain of your deployment server                              |
| `SERVER_USER`       | SSH username (e.g., `ubuntu`)                                               |
| `SERVER_SSH_KEY`    | Private SSH key in PEM format, without passphrase, **single-line string**   |

> ⚠️ The SSH key must be in PEM format (`id_rsa`) and should not contain line breaks.

## About ARM architecture
**if your server runs on linux/amd64 architecture (this is most servers), in `.github/workflows/ci-cd.yml` you need to replace the corresponding job with the following:**
```yml
      - name: Build and push backend Docker image (x86 only)
        uses: docker/build-push-action@v5
        with:
          context: ./server
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/backend:latest
          platforms: linux/amd64
```
```yml
      - name: Build and push frontend Docker image (x86 only)
        uses: docker/build-push-action@v5
        with:
          context: ./client
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/frontend:latest
          platforms: linux/amd64
```
### [Docker + Docker compose Installing to ubuntu)](https://tomerklein.dev/step-by-step-tutorial-installing-docker-and-docker-compose-on-ubuntu-a98a1b7aaed0)
## Server configuration

#### 1. Create Project Folder
```bash
cd ~ && mkdir electric-avenue && cd electric-avenue
```
### 2. Create `docker-compose.prod.yml`
Inside the project folder, create a file named `docker-compose.prod.yml` and fill it with the production docker-compose configuration (I uploaded the finished version to the repository.)
### 3. Create `client` and `server` Folders with `.env` Files
```bash
mkdir client && cd client
vim .env 
```
Fill `.env` with the example provided in repository.
Go back and create the `server` folder and its `.env` file:
```bash
cd .. && mkdir server && cd server
vim .env
```
Again, fill `.env` according to the example from repository.

Return to the project root: `cd ..`
### 4. Install and Configure Nginx
Update packages and install Nginx:
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl status nginx
```
Remove the default Nginx site configuration:
```bash
sudo rm /etc/nginx/sites-enabled/default
```
Create a new Nginx configuration file for your app:
```bash
sudo vim /etc/nginx/sites-available/myapp
```
Paste your Nginx configuration into this file (you can use the example `nginx.conf` from repository).

**IMPORTANT:**  
Replace the `server_name` directive with your server's IP address or your domain name.

Enable the site by creating a symbolic link:
```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
Now your server should be ready to run your Dockerized project with Nginx as a reverse proxy

### 5. Add SSL sertificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx
```
- ### [Create Google Console](https://console.cloud.google.com/projectcreate)
- ### [Instructions to create Oauth2 Client ID](https://medium.com/@flavtech/google-oauth2-authentication-with-nestjs-explained-ab585c53edec)
- ### Fill .env files
