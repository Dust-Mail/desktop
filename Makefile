.PHONY: release

release: BUMP = $(filter-out $@,$(MAKECMDGOALS))

release:
	npm version $(BUMP) && git push origin main --tags
