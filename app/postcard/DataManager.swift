//
//  DataManager.swift
//  postcard
//
//  Created by Ashwin Agarwal on 5/20/23.
//

import Foundation

@MainActor class DataManager: ObservableObject {
    @Published var messages: [Message] = [];
    
    init() {
        fetchMessages()
    }
    
    func fetchMessages() {
        Task {
            do {
                // Fetch all
                messages = try await supabase.database
                    .from("messages")
                    .execute().value
                print(messages)
            } catch {
                print("### Fetch Error: \(error)")
            }
        }
    }
    
    func markAllAsRead() {
        Task {
            do {
                // Mark all as read
                for var message in messages {
                    message.isReadByFridge = true
                    try await supabase.database.from("messages").update(values: message).eq(column: "id", value: message.id).execute()
                }
                
            } catch {
                print("### Update Error: \(error)")
            }
        }
    }
}
