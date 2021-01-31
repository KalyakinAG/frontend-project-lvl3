install:
	npm install
uninstall:
	npm uninstall
lint:
	npx eslint .
link:
	npm link
test:
	npm test
test-coverage:
	npm test -- --coverage --coverageProvider=v8
publish:
	npm publish --dry-run
