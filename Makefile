MANAGER=console-backend-data-manager:release5.0
LOGGER=console-backend-data-logger:release5.0

REGISTRY=pnda

build:		build-manager build-logger

upload:		upload-manager upload-logger

build-manager:	## Build the manager docker image
	docker build -t "$(MANAGER)" -f Dockerfile.data-manager .

upload-manager:	## Upload manager image to registry
	docker tag "$(MANAGER)" "$(REGISTRY)/$(MANAGER)"
	docker push "$(REGISTRY)/$(MANAGER)"

build-logger:	## Build the logger docker image
	docker build -t "$(LOGGER)" -f Dockerfile.data-logger .

upload-logger:	## Upload logger image to registry
	docker tag "$(LOGGER)" "$(REGISTRY)/$(LOGGER)"
	docker push "$(REGISTRY)/$(LOGGER)"

help:	## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: help build upload
.DEFAULT_GOAL := help
