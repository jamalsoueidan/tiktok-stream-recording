# Azure CLOUD

## Azure Setup

1. Set Up the Azure Container Registry
2. Push the image to Azure Container Registry
3. Set Up Azure Credentials for Programmatic Access

After running this command, Azure will create the service principal and assign it the "Contributor" role over the specified subscription or scope.

```shell
az ad sp create-for-rbac --name <random-service-principal-name> --role contributor --scopes /subscriptions/<subscription-id>
```

This will output a JSON response containing the client_id, client_secret, tenant_id, and subscription_id.
Store the Credentials securely, as you'll use them to authenticate when making requests to the Azure API from Convex.

4. Create storage account (HOT)
   Then get the connection string for the storage account, security + networking > access keys (key1-connection.string)

## Image build

### Build/Update the image locally and see the size

Build image

```shell
docker build -t tiktok .
```

Run image locally

```shell
docker run -it --rm -e AzureStorageconnection="DefaultEndpointsProtocol=https;AccountName=tiktokvideosstreaming;AccountKey=Ccb8N5+siNNHXunreHbVobHAIt0NkYELAUIcedeAhwcwTSatymEsLEFE1JhsEcmXEYthMb2XTw06+AStluomaA==;EndpointSuffix=core.windows.net" -e TIKTOK_CHANNEL="nanita.yol" tiktok
```

See all images

```shell
docker images
```

Check image filesize

```shell
docker history tiktok
```

### Push the image to Azure remember higher version number

Login first

```shell
az acr login --name <container-registry-name> // az acr login --name convextiktok
```

Tag image

```shell
docker tag <local-image-name> <container-registry-name>.azurecr.io/<local-image-name>:v4 // docker tag tiktok convextiktok.azurecr.io/tiktok:v5
```

Push image

````shell
docker push <container-registry-name>.azurecr.io/<local-image-name>:v4 /// docker push convextiktok.azurecr.io/tiktok:v5
```¨

Stream log from Azure
```shell
az container attach --resource-group tiktok --name streamtiktok
````

##

### Find the images in Azure

Container Registry -> Repositories -> tiktok

### See running instances

On Azure you can go to Container Instances and see all running instances
Local CMD, you can type to get all instances

```shell
az container list --resource-group tiktok --output table
```

To get Log output for specific instance

```shell
az container logs --resource-group tiktok --name streamp-rocessor-test
```
