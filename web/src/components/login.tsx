import { createSignal } from "solid-js";

interface Props {
  onSubmit: (email: string, token: string) => void;
}

interface RandomUser {
  email: string;
  name: {
    first: string;
    last: string;
  };
  picture: {
    thumbnail: string;
  };
  login: {
    uuid: string;
  };
}

// UTF-8 safe Base64 encoding function
function utfToBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );
}

export default function Login(props: Props) {
  const [loading, setLoading] = createSignal(false);

  const generateRandomUser = async () => {
    setLoading(true);
    try {
      console.log("Generating random user...");
      const response = await fetch("https://randomuser.me/api/");
      const data = await response.json();
      const user: RandomUser = data.results[0];
      console.log("Random user generated:", user);
      const workspaceUser = {
        id: user.login.uuid,
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        photoURL: user.picture.thumbnail,
      };
      console.log("Workspace user created:", workspaceUser);
      const token = utfToBase64(JSON.stringify(workspaceUser));
      console.log("Token generated:", token);
      props.onSubmit(user.email, token);
    } catch (error) {
      console.error("Error generating random user:", error);
      alert("Failed to generate random user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="inset-0 w-full h-lvh absolute bg-zinc-900">
      <div class="w-full h-full flex flex-col items-center justify-center">
        <div class="border border-zinc-800 rounded p-12 flex flex-col gap-4 items-center">
          <span class="text-2xl font-bold">Sign in to NATS Chat</span>
          <button
            onClick={generateRandomUser}
            disabled={loading()}
            class="bg-zinc-100 text-zinc-800 px-4 py-3 text-lg rounded font-semibold hover:bg-zinc-300 disabled:bg-zinc-100/50"
          >
            {loading() ? "Generating..." : "Generate Random User"}
          </button>
        </div>
      </div>
    </div>
  );
}
