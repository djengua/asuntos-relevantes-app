

```
cd android
./gradlew --stop
./gradlew clean
./gradlew :capacitor-android:compileDebugJavaWithJavac --no-build-cache --stacktrace
cd ..
npx cap sync android
npx cap run android
```