class UpdatePostAttachmentFilenames < ActiveRecord::Migration[8.0]
  Post.find_each do |post|
    # Update poster filename
    if post.poster.attached?
      blob = post.poster.blob
      blob.update(filename: "#{blob.filename}.jpg") if blob.filename.extension != "jpg"
    end

    # Update cover filename
    if post.cover.attached?
      blob = post.cover.blob
      blob.update(filename: "#{blob.filename}.jpg") if blob.filename.extension != "jpg"
    end

    # Update audio filename
    if post.audio.attached?
      blob = post.audio.blob
      blob.update(filename: "#{blob.filename}.mp3") if blob.filename.extension != "mp3"
    end
  end
end
