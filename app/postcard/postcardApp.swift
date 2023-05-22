//
//  postcardApp.swift
//  postcard
//
//  Created by Ashwin Agarwal on 5/20/23.
//

import Supabase
import Realtime
import SwiftUI

@main
struct postcardApp: App {
    @StateObject private var dataManager = DataManager()
    
    init() {
        supabaseRealtime.connect()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView(thisFridge: $dataManager.thisFridge).environmentObject(dataManager)
        }
    }
}

// These secrets should live in gitignored file, e.g. _Secrets.swift
let supabase = SupabaseClient(
    supabaseURL: Secrets.supabaseURL,
    supabaseKey: Secrets.supabaseAnonKey
)

var supabaseRealtime = RealtimeClient(endPoint: Secrets.supabaseURL.appendingPathComponent("/realtime/v1").absoluteString, params: ["apikey": Secrets.supabaseAnonKey])
