.PHONY: release

release: BUMP = $(filter-out $@,$(MAKECMDGOALS))

release:
	npm run changelog
	git add CHANGELOG.md
	git commit -m "Update changelog"
	npm version $(BUMP)
	git push origin main --tags
	git push origin main
