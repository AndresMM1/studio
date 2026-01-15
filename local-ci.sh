#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Local CI/CD Simulation ===${NC}"

# Stage 1: Install Dependencies
echo -e "\n${BLUE}[Stage 1] Installing Dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo "node_modules already exists. Skipping full install (running prune/install just in case)."
    npm ci
else
    npm ci
fi
echo -e "${GREEN}Dependencies installed.${NC}"

# Stage 2: Test & Coverage
echo -e "\n${BLUE}[Stage 2] Running Tests & Coverage...${NC}"
if npm run coverage; then
    echo -e "${GREEN}Tests passed.${NC}"
else
    echo -e "${RED}Tests failed!${NC}"
    exit 1
fi

# Generate specific report formats (optional, vitest already does this based on config)
# npx nyc report --reporter=lcov --reporter=text <-- Removing this as vitest handles it

# Stage 3: Build
echo -e "\n${BLUE}[Stage 3] Building Project...${NC}"
if npm run build; then
    echo -e "${GREEN}Build successful.${NC}"
else
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# Stage 4: SonarQube (Optional Local Check)
echo -e "\n${BLUE}[Stage 4] SonarQube Check...${NC}"
if command -v sonar-scanner &> /dev/null; then
    echo "SonarScanner found. Running local analysis..."
    # Note: You need a local SonarQube server running or SONAR_TOKEN/HOST env vars set for a remote one.
    # checking if env vars exist
    if [ -z "$SONAR_TOKEN" ] || [ -z "$SONAR_HOST_URL" ]; then
        echo -e "${RED}Skipping SonarQube: SONAR_TOKEN or SONAR_HOST_URL not set.${NC}"
    else
         EXTRA_COVERAGE=""
         if [ -f coverage/lcov.info ]; then
             EXTRA_COVERAGE="-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"
         fi
         
         sonar-scanner \
            -Dsonar.projectKey=local-debug \
            -Dsonar.sources=src \
            -Dsonar.tests=test \
            -Dsonar.test.inclusions="test/*/.spec.ts" \
            -Dsonar.sourceEncoding=UTF-8 \
            -Dsonar.host.url="$SONAR_HOST_URL" \
            -Dsonar.login="$SONAR_TOKEN" \
            $EXTRA_COVERAGE
    fi
else
    echo "SonarScanner not installed locally. Skipping."
fi

echo -e "\n${GREEN}=== Local CI/CD Simulation Completed Successfully ===${NC}"
echo "Ready for commit!"
