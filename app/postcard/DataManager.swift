//
//  DataManager.swift
//  postcard
//
//  Created by Ashwin Agarwal on 5/20/23.
//

import Foundation

@MainActor class DataManager: ObservableObject {
    @Published var messages: [Message] = []
    @Published var thisFridge: Fridge? = nil
    
    init() {
        loadThisFridge()
    }
    
    func fetchNewMessages() {
        Task {
            do {
                // Fetch all
                print(thisFridge!.id)
                messages = try await supabase.database
                    .from("messages")
                    .select()
                    .eq(column: "fridge_id", value: thisFridge!.id)
//                    .eq(column: "is_read_by_fridge", value: false)
                    .execute().value
                print(messages)
                for (index, _) in messages.enumerated() {
                    let result = try await supabase.database
                        .from("senderfridgeedges")
                        .select(columns: "sender_name")
                        .eq(column: "fridge_id", value: messages[index].fridgeID)
                        .eq(column: "sender_id", value: messages[index].senderID)
                        .execute().value as [[String: String]]
                    if (result.count > 0) {
                        messages[index].senderName = result[0]["sender_name"]
                    }
                }
            } catch {
                print("### fetchNewMessages Error: \(error)")
            }
        }
    }

    func markMessageRead(message: Message) {
        Task {
            do {
                var updatedMessage = message
                updatedMessage.isReadByFridge = true
                updatedMessage.senderName = nil
                try await supabase.database.from("messages").update(values: updatedMessage).eq(column: "id", value: message.id).execute()
                fetchNewMessages()
            } catch {
                print("### markMessageRead Error: \(error)")
            }
        }
    }

    private static func fridgeFileURL() throws -> URL {
        try FileManager.default.url(for: .documentDirectory,
                                    in: .userDomainMask,
                                    appropriateFor: nil,
                                    create: false)
        .appendingPathComponent("fridge.data")
    }

    func findThisFridge(fridgeNumber: String) {
        Task {
            do {
                let fridges = try await supabase.database
                    .from("fridges")
                    .select()
                    .eq(column: "fridge_number", value: Int(fridgeNumber)!)
                    .execute().value as [Fridge]
                if fridges.count > 0 {
                    thisFridge = fridges[0]
                    saveThisFridge()
                } else {
                    print("Phone number not found!")
                }

            } catch {
                print("### findFridge Error: \(error)")
            }
        }
    }

    func updateThisFridge() {
        Task {
            do {
                try await supabase.database.from("fridges").update(values: thisFridge).eq(column: "id", value: thisFridge!.id).execute()
                saveThisFridge()
            } catch {
                print("### updateThisFridge Error: \(error)")
            }
        }
    }

    func loadThisFridge() {
        Task {
            do {
                let fileURL = try Self.fridgeFileURL()
                let data = try Data(contentsOf: fileURL)
                thisFridge = try JSONDecoder().decode(Fridge.self, from: data)
            } catch {
                print("### loadFridge Error: \(error)")
            }
        }
    }

    func saveThisFridge() {
        Task {
            do {
                let data = try JSONEncoder().encode(thisFridge)
                let outfile = try Self.fridgeFileURL()
                try data.write(to: outfile)
            } catch {
                print("### saveFridge Error: \(error)")
            }
        }
    }
    
    func getImageString(id: UUID, open: Bool) -> String {
        let hash = abs(id.uuidString.hashValue)
        var imageString = String((hash % 5) + 1)
        if (open) {
            imageString.append("_open")
        }
        return imageString
    }
}
