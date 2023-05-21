//
//  Models.swift
//  postcard
//
//  Created by Ashwin Agarwal on 5/20/23.
//

import Foundation

struct Message: Encodable, Decodable {
    let id: UUID
    let createdAt: Date
    let fridgeID: UUID
    let senderID: UUID
    let link: String
    var senderName: String?
    
    var note: String
    var isReadByFridge: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case createdAt = "created_at"
        case fridgeID = "fridge_id"
        case senderID = "sender_id"
        case link
        case senderName
        
        case note
        case isReadByFridge = "is_read_by_fridge"
    }
}

struct Fridge: Codable {
    let id: UUID
    let createdAt: Date
    var fridgeName: String
    let fridgeNumber: Int64

    enum CodingKeys: String, CodingKey {
        case id
        case createdAt = "created_at"
        case fridgeName = "fridge_name"
        case fridgeNumber = "fridge_number"
    }
}
