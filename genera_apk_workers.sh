#!/bin/bash

# Define paths and variables
PROJECT_PATH="./TeleCoffe_Workers_temp"
SOURCE_PATH="./TeleCoffe_Workers"
RESOURCES_PATH="../Resources/TeleCoffee_Workers/android/res/"
APK_DESTINATION="TeleCoffe_Workers.apk"

# Remove the old project directory if it exists and copy the new one
echo "Setting up the project..."
rm -rf $PROJECT_PATH
cp -r $SOURCE_PATH $PROJECT_PATH

# Enter the project directory
cd $PROJECT_PATH || exit

# Clean up and set up android
echo "Preparing Android..."
rm -rf ./android/
npm install @capacitor/android @capacitor/core --legacy-peer-deps

# Initialize Capacitor and build the project
echo "Initializing Capacitor and building the project..."
npx cap add android && npm run build && npx cap copy android && npx cap sync android

# Sync resources and build Android
echo "Syncing resources and building Android..."
rsync -av $RESOURCES_PATH ./android/app/src/main/res/
cp ../Resources/TeleCoffee_Workers/build.gradle ./android/app/build.gradle
cp ../Resources/TeleCoffee_Workers/AndroidManifest.xml ./android/app/src/main/AndroidManifest.xml
npx cap copy android && npx cap sync android

# Build using Gradle
cd ./android/ || exit
echo "Building with Gradle..."
./gradlew tasks && ./gradlew updateLintBaseline && ./gradlew build

# Copy APK to destination
cd ..
cp ./android/app/build/outputs/apk/debug/app-debug.apk "../$APK_DESTINATION"

# Delete temp folder
cd ..
rm -rf $PROJECT_PATH

echo "Process completed successfully!"
