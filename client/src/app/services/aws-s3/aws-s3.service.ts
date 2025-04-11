import { Injectable } from '@angular/core';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { RootProviderService } from '../root-provider/root-provider.service';

@Injectable({
  providedIn: 'root'
})
export class AwsS3Service {

  private s3Client!: S3Client;

  constructor(private rootProviderService: RootProviderService) {
    this.rootProviderService.provideS3().subscribe(response => {
      
      const creds = rootProviderService.provideDecrypt(response.as3wsb);      
      this.s3Client = new S3Client({
        region: creds.S3_REGION,
        credentials: {
          accessKeyId: creds.S3_ACCESS_KEY_ID,
          secretAccessKey: creds.S3_SECRET_ACCESS_KEY
        }
      });
    });
  }

  async uploadFileToS3(s3Folder: string, file: File, fileName: string): Promise<any> {
    try {
      const params = {
        Bucket: 'yara-web',
        Key: `${s3Folder}/${fileName}.jpeg`,
        Body: file,
        ContentType: file.type 
      };

      const command = new PutObjectCommand(params);
      const data = await this.s3Client.send(command);
      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  }

  async uploadFile(s3Folder: string, file: File, fileName: string): Promise<any> {
    try {
      const params = {
        Bucket: 'yara-web',
        Key: `${s3Folder}/${fileName}`,
        Body: file,
        ContentType: file.type 
      };

      const command = new PutObjectCommand(params);
      const data = await this.s3Client.send(command);
      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  }
}
