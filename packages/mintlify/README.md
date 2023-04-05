<div align="center">
  <a href="https://mintlify.com">
    <img
      src="https://res.cloudinary.com/mintlify/image/upload/v1665385627/logo-rounded_zuk7q1.svg"
      alt="Mintlify Logo"
      height="64"
    />
  </a>
  <br />
  <p>
    <h3>
      <b>
        Mintlify CLI
      </b>
    </h3>
  </p>
  <p>
    The Mintlify CLI is the easiest way to build Mintlify apps from the command line.
  </p>
  <p>

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](/) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fmintlify.com&logo=mintlify)](https://mintlify.com) [![Unit Tests](https://github.com/mintlify/mint/actions/workflows/unit-tests.yaml/badge.svg)](https://github.com/mintlify/mint/actions/workflows/unit-tests.yaml) [![Tweet](https://img.shields.io/twitter/url?url=https%3A%2F%2Fmintlify.com%2F)](https://twitter.com/intent/tweet?url=&text=Check%20out%20%40mintlify) [![Chat on Discord](https://img.shields.io/badge/chat-Discord-7289DA?logo=discord)](https://discord.gg/MPNgtSZkgK) [![Discuss on GitHub](https://img.shields.io/badge/discussions-GitHub-333333?logo=github)](https://github.com/mintlify/mint/discussions)

  </p>
  <p>
    <sub>
      Built with ❤︎ by
      <a href="https://mintlify.com">
        Mintlify
      </a>
    </sub>
  </p>
</div>

### 🚀 Installation

Download the Mintlify CLI using the following command

```
npm i -g mintlify
```

### 👩‍💻 Development

Run the following command at the root of your Mintlify application to preview changes locally.

```
mintlify dev
```

Note - `mintlify dev` requires `yarn` and it's recommended you install it as a global installation. If you don't have yarn installed already run `npm install --global yarn` in your terminal.

### Custom Ports

Mintlify uses port 3000 by default. You can use the `--port` flag to customize the port Mintlify runs on. For example, use this command to run in port 3333:

```
mintlify dev --port 3333
```

You will see an error like this if you try to run Mintlify in a port that's already taken:

```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Troubleshooting

Steps you can take if the dev CLI is not working (After each step try to run `mintlify dev` again):

- Make sure you are running in a folder with a `mint.json` file.
- Make sure you are using Node v18 or higher.
- Run `mintlify install` to re-install dependencies.
- Navigate to the `.mintlify` folder in your home directory and delete its contents.

### 🏃 Get Started

[Create an account](https://mintlify.com/start) to start using Mintlify for your documentation.
