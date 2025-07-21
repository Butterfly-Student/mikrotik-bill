import { MikrotikClient, StreamData } from './lib/mikrotik/client';
// import "@/lib/mikrotik/patc-empty"; // ← baris ini penting
import { RouterOSAPI } from "node-routeros";



const api = new MikrotikClient({
	host: "192.168.111.1",
	user: "admin",
	password: "r00t",
});

api.connect().then(() => {
	api.streamData(
		(data: StreamData) => {
			console.log(data);
		},
		(err: any) => {
			console.error("Error:", err);
		},
		"/interface/monitor-traffic",
		"ether2"
	);
});

// better-torch-test.ts
// import { MikrotikClient } from "./lib/mikrotik/client";


// const mikrotik = new MikrotikClient({
// 	host: "192.168.111.1",
// 	user: "admin",
// 	password: "r00t",
// });

// ( () => {
// 	console.log("📡 Starting torch test...");

// 	try {
// 		 mikrotik.startTorchStream(
// 			"ether2",
// 		);
// 	} catch (err) {
// 		console.error("❌ Failed to start stream:", err);
// 	}
// })();

// startTorchStream(
//   interfaceName: string = "ether2",
// ){
//   console.log("📡 Starting torch stream...");

//   // Force reconnection for torch streams to avoid connection state issues
//   // if (this.isConnected) {
//   // 	await this.disconnect();
//   // }

//   console.log("🔌 Connected to MikroTik in startTorchStream");

//   const streamId = `torch-${interfaceName}-${Date.now()}`;
//   console.log("🆔 Stream ID:", streamId);

//   try {
//     // Create a fresh menu instance for torch
//     this.client.connect().then((client) => {
//       client
//         .menu("/tool torch")
//         .where({ interface: interfaceName })
//         .stream((err: any, data: any) => {
//           console.log("📥 Stream callback triggered");

//           if (err) {
//             console.error("Torch stream error:", err);
//             return;
//           }

//           console.log("📦 Raw data from MikroTik:", data);

//           const streamData: StreamData = {
//             type: "torch",
//             data: {
//               ...data,
//               interface: interfaceName,
//             },
//             timestamp: new Date(),
//           };
//         });

//       console.log("✅ Torch stream started successfully");
//     })
//     // return streamId;

//   } catch (error) {
//     console.error("Failed to start torch stream:", error);
//     throw error;
//   }
// }
