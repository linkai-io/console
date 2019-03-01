APP_ENV = dev

build: 
	npm run build 

deploy: build
	aws s3 sync dist/ s3://linkai-console/${APP_ENV}/private
