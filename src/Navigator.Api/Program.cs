using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();

var app = builder.Build();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
});
app.MapHealthChecks("/health/ready");

if (app.Environment.IsProduction())
{
    app.UseDefaultFiles();
    app.UseStaticFiles();

    app.Map("/api", () => Results.NotFound());
    app.Map("/api/{**path}", () => Results.NotFound());
    app.Map("/health", () => Results.NotFound());
    app.Map("/health/{**path}", () => Results.NotFound());
    app.MapFallbackToFile("index.html");
}

app.Run();

public partial class Program
{
}
