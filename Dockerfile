FROM node:22-bookworm-slim AS frontend-build
WORKDIR /src/web/Navigator.Web
COPY web/Navigator.Web/package.json web/Navigator.Web/package-lock.json ./
RUN npm ci
COPY web/Navigator.Web/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY Navigator.sln global.json Directory.Build.props Directory.Packages.props ./
COPY src/Navigator.Domain/Navigator.Domain.csproj src/Navigator.Domain/
COPY src/Navigator.Application/Navigator.Application.csproj src/Navigator.Application/
COPY src/Navigator.Infrastructure/Navigator.Infrastructure.csproj src/Navigator.Infrastructure/
COPY src/Navigator.Api/Navigator.Api.csproj src/Navigator.Api/
COPY tests/Navigator.Api.IntegrationTests/Navigator.Api.IntegrationTests.csproj tests/Navigator.Api.IntegrationTests/
RUN dotnet restore Navigator.sln
COPY src/ src/
RUN dotnet publish src/Navigator.Api/Navigator.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
ARG VERSION=0.0.0
ARG SOURCE_REVISION=unknown
LABEL org.opencontainers.image.title="Navigator" \
      org.opencontainers.image.description="Navigator disposable GPU workload control plane" \
      org.opencontainers.image.version="$VERSION" \
      org.opencontainers.image.revision="$SOURCE_REVISION"
RUN apt-get update \
    && apt-get install --yes --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=backend-build --chown=app:app /app/publish/ ./
COPY --from=frontend-build --chown=app:app /src/web/Navigator.Web/dist/ ./wwwroot/
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
USER app
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
    CMD curl --fail --silent --show-error http://127.0.0.1:8080/health/ready >/dev/null || exit 1
ENTRYPOINT ["dotnet", "Navigator.Api.dll"]
