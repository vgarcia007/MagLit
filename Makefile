.PHONY: maglit docker-pull

build: maglit

docker-pull:
	docker pull node:17-alpine

maglit: docker-pull
	docker build --no-cache -t maglit -f Dockerfile .