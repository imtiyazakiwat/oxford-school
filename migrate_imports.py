import os
import re

def replace_supabase_imports(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace @/supabase/ with @/firebase/
                new_content = content.replace('@/supabase/', '@/firebase/')
                
                # Replace imports from ./supabase/ or ../supabase/
                new_content = re.sub(r'from\s+["\'](\.\.?/)+supabase/([^"\']+)["\']', 
                                   r'from "\1firebase/\2"', new_content)
                
                # Special case for supabase/supabase -> firebase/firebase
                new_content = new_content.replace('from "@/firebase/supabase"', 'from "@/firebase/firebase"')
                new_content = new_content.replace('from "./supabase"', 'from "./firebase"')
                new_content = new_content.replace('from "../supabase"', 'from "../firebase"')
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {path}")

if __name__ == "__main__":
    replace_supabase_imports('src')
