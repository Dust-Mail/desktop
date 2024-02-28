{
  description = "Dust-Mail client";

  inputs = {
    systems.url = "github:nix-systems/default";
    flake-compat.url = "https://flakehub.com/f/edolstra/flake-compat/1.tar.gz";
  };

  outputs =
    { systems
    , nixpkgs
    , ...
    } @ inputs:

    let
      eachSystem = f:
        nixpkgs.lib.genAttrs (import systems) (
          system:
          f nixpkgs.legacyPackages.${system}
        );

      # package = builtins.fromJSON (builtins.readFile "./package.json");

      buildInputs = pkgs: with pkgs;
        [
          # You can set the major version of Node.js to a specific one instead
          # of the default version
          nodejs_20

          nodePackages.npm
          yarn

          nodePackages.typescript
          nodePackages.typescript-language-server
        ];

    in
    {
      devShells = eachSystem
        (pkgs: {
          default = pkgs.mkShell
            {
              buildInputs = buildInputs pkgs;
            };
        });

      packages = eachSystem
        (pkgs: {
          default = pkgs.buildNpmPackage
            {
              pname = "dust-mail-web";
              version = "1.0.2";

              src = ./.;

              npmDepsHash = "sha256-+ILACZEyev4sZDw/kuQl6RGhWGKYCHJvbMuOIUvOGk0=";

              npmFlags = [ "--legacy-peer-deps" ];

              buildInputs = buildInputs pkgs;

              buildPhase = ''npm run build'';

              installPhase = '''';
            };

        });
    };

}
