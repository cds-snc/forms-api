using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

namespace dotnet
{
  public class AccessTokenGenerator
  {
    public static async Task<string> Generate(string identityProviderUrl, string projectIdentifier, PrivateApiKey privateApiKey)
    {
      try
      {
        RSA rsa = RSA.Create();

        rsa.ImportFromPem(privateApiKey.key);

        RsaSecurityKey rsaSecurityKey = new(rsa)
        {
          KeyId = privateApiKey.keyId,
        };

        SigningCredentials signingCredentials = new(rsaSecurityKey, SecurityAlgorithms.RsaSha256);

        JwtSecurityToken jwtSecurityToken = new(
          claims: [
            new Claim("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer),
            new Claim("iss", privateApiKey.userId),
            new Claim("sub", privateApiKey.userId),
            new Claim("aud", identityProviderUrl),
            new Claim("exp", ((DateTimeOffset)DateTime.UtcNow.AddMinutes(1)).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer)
          ],
          signingCredentials: signingCredentials
        );

        string jwtSignedToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);

        Dictionary<string, string> requestParameters = new()
        {
          { "grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer" },
          { "assertion", jwtSignedToken },
          { "scope", $"openid profile urn:zitadel:iam:org:project:id:{projectIdentifier}:aud" }
        };

        HttpClient httpClient = new()
        {
          BaseAddress = new Uri(identityProviderUrl),
          Timeout = TimeSpan.FromSeconds(3)
        };

        // For the API to accept requests we need to set the `User-Agent` header parameter
        httpClient.DefaultRequestHeaders.Add("User-Agent", "AccessTokenGenerator/1.0");

        TokenResponse response = await httpClient.PostAsync(
            "/oauth/v2/token",
            new FormUrlEncodedContent(requestParameters)
          )
          .Result
          .Content
          .ReadFromJsonAsync<TokenResponse>();

        return response.access_token;
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to generate access token", exception);
      }
    }

    private struct TokenResponse
    {
      public required string access_token { get; set; }
    }
  }
}