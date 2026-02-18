using Microsoft.Extensions.DependencyInjection;
using TipTap.Blazor.Interop;

namespace TipTap.Blazor;

/// <summary>
/// Extension methods for registering TipTap.Blazor services.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers the TipTap.Blazor services required by the editor components.
    /// Call this in Program.cs: <c>builder.Services.AddTipTapBlazor();</c>
    /// </summary>
    public static IServiceCollection AddTipTapBlazor(this IServiceCollection services)
    {
        services.AddScoped<TipTapInterop>();
        return services;
    }
}
