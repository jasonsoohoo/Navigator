#!/usr/bin/env sh
set -eu

dotnet restore Navigator.sln
dotnet build Navigator.sln --configuration Release --no-restore
dotnet test Navigator.sln --configuration Release --no-build
