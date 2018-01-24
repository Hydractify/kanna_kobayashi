#!/bin/bash

AUTHOR_NAME=$(git log -1 $TRAVIS_COMMIT --pretty=%aN)
GRAVATAR_HASH=$(git log -1 $TRAVIS_COMMIT --pretty=%ae | tr -d '\n' | tr '[:upper:]' '[:lower'] | md5sum | cut -d ' ' -f 1)

if [ $TRAVIS_TEST_RESULT == 0 ]; then
	STATUS=Passed
	# 3779158 - green
	COLOR=3779158
else
	STATUS=Failed
	# 16711680 - red
	COLOR=16711680
fi

read -d '' DATA<<-EOF
{
	"avatar_url": "https://i.imgur.com/kOfUGNS.png",
	"username": "Travis CI",
	"embeds": [{
		"author": {
			"name": "Build #${TRAVIS_BUILD_NUMBER} ${STATUS} - ${AUTHOR_NAME}",
			"url": "https://travis-ci.org/${TRAVIS_REPO_SLUG}/builds/${TRAVIS_BUILD_ID}",
			"icon_url": "https://www.gravatar.com/avatar/${GRAVATAR_HASH}"
		},
		"title": "[${TRAVIS_REPO_SLUG}:${TRAVIS_BRANCH}]",
		"url": "https://github.com/${TRAVIS_REPO_SLUG}/tree/${TRAVIS_BRANCH}",
		"color": ${COLOR},
		"description": "[\`${TRAVIS_COMMIT:0:7}\`](https://github.com/${TRAVIS_REPO_SLUG}/commit/${TRAVIS_COMMIT}) - ${TRAVIS_COMMIT_MESSAGE}",
		"timestamp": "$(date --utc +%FT%TZ)"
	}]
}
EOF

curl \
-H Content-Type:application/json \
-H User-Agent:bot \
-d "$DATA" \
$WEBHOOK_URL