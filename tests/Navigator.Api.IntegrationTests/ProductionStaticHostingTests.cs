using System.Net;

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Navigator.Api.IntegrationTests;

public sealed class ProductionStaticHostingTests : IClassFixture<ProductionWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ProductionStaticHostingTests(ProductionWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Theory]
    [InlineData("/")]
    [InlineData("/registries")]
    [InlineData("/sessions")]
    public async Task BrowserRouteReturnsSpaEntryDocument(string path)
    {
        using var response = await _client.GetAsync(path);
        var content = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
        Assert.Contains("navigator-test-root", content, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("/api/does-not-exist")]
    [InlineData("/health/does-not-exist")]
    public async Task UnknownReservedRouteDoesNotReturnSpaEntryDocument(string path)
    {
        using var response = await _client.GetAsync(path);
        var content = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.DoesNotContain("navigator-test-root", content, StringComparison.Ordinal);
    }
}

public sealed class ProductionWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Production");
        builder.UseWebRoot(Path.Combine(AppContext.BaseDirectory, "TestWebRoot"));
    }
}
