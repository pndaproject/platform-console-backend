MANAGER=console-backend-data-manager:0.1.2
LOGGER=console-backend-data-logger:0.1

REGISTRY=containers.cisco.com/donaldh

build-manager:	## Build the manager docker image
	docker build -t "$(MANAGER)" -f Dockerfile.data-manager .

upload-manager:	## Upload manager image to registry
	docker tag "$(MANAGER)" "$(REGISTRY)/$(MANAGER)"
	docker push "$(REGISTRY)/$(MANAGER)"

build-logger:	## Build the logger docker image
	docker build -t "$(LOGGER)" -f Dockerfile.data-manager .

upload-logger:	## Upload logger image to registry
	docker tag "$(LOGGER)" "$(REGISTRY)/$(LOGGER)"
	docker push "$(REGISTRY)/$(LOGGER)"

help:	## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: help
.DEFAULT_GOAL := help
