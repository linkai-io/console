APP_ENV = dev

build: 
	npm run build 

deploy: build
	aws s3 sync dist/ s3://linkai-console/${APP_ENV}/private

deployimg: 
	aws s3 sync img/tech s3://linkai-console/${APP_ENV}/private/img/

deployprodimg:
	aws s3 sync img/tech s3://linkai-console/prod/private/img/

deployprod: build 
	aws s3 sync dist/ s3://linkai-console/prod/private